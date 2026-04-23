namespace InventoryAlpha

open System
open WebSharper
open WebSharper.JavaScript
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Html

[<JavaScript>]
module Client =

    [<Inline "var a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,' + encodeURIComponent($1); a.download=$0; document.body.appendChild(a); a.click(); document.body.removeChild(a);">]
    let private downloadText (fileName: string) (content: string) : unit = X<unit>

    [<Inline "($0 && $0.length > 0) ? $0[0] : null">]
    let private firstFile (files: obj) : obj = X<obj>

    [<Inline "if ($0) { var reader = new FileReader(); reader.onload = function () { $1(reader.result ? String(reader.result) : ''); }; reader.readAsText($0); }">]
    let private readFileAsText (file: obj) (callback: string -> unit) : unit = X<unit>

    let private categoryOptions =
        [
            "", "All categories"
            "Components", "Components"
            "Office", "Office"
            "Packaging", "Packaging"
            "Safety", "Safety"
            "Electronics", "Electronics"
        ]

    let private actionOptions =
        [
            "Issue", "Issue"
            "Restock", "Restock"
            "Adjustment", "Adjustment"
        ]

    let private roleOptions =
        [
            "Administrator", "Administrator"
            "Manager", "Manager"
            "Clerk", "Clerk"
            "Viewer", "Viewer"
        ]

    let private asCategoryFilter value =
        match value with
        | "Components" -> Some Components
        | "Office" -> Some Office
        | "Packaging" -> Some Packaging
        | "Safety" -> Some Safety
        | "Electronics" -> Some Electronics
        | _ -> None

    let private asMovementKind value =
        match value with
        | "Restock" -> Restock
        | "Adjustment" -> Adjustment
        | _ -> Issue

    let private asUserRole value =
        match Domain.parseRole value with
        | Some role -> role
        | None -> Viewer

    let private tryInt (textValue: string) =
        match Int32.TryParse(textValue.Trim()) with
        | true, value -> Some value
        | _ -> None

    let private metricCard (tone: string) (title: string) (valueView: View<string>) (detailView: View<string>) =
        div [attr.``class`` ("metric-card " + tone)] [
            p [attr.``class`` "metric-label"] [text title]
            h2 [attr.``class`` "metric-value"] [textView valueView]
            p [attr.``class`` "metric-detail"] [textView detailView]
        ]

    let private permissionChip (enabledState: bool) (labelText: string) =
        let tone = if enabledState then "permission-chip permission-on" else "permission-chip permission-off"
        span [attr.``class`` tone] [text labelText]

    let private statusPill (item: InventoryItem) =
        let status = Domain.statusFor item
        span [attr.``class`` (Domain.statusCss status)] [text (Domain.statusLabel status)]

    let private rolePill (user: AppUser) =
        span [attr.``class`` (Domain.roleCss user.Role)] [text (Domain.roleLabel user.Role)]

    let private renderMovement (movement: StockMovement) =
        let tone =
            match movement.Kind with
            | Issue -> "movement movement-issue"
            | Restock -> "movement movement-restock"
            | Adjustment -> "movement movement-adjustment"

        li [attr.``class`` tone] [
            div [attr.``class`` "movement-topline"] [
                strong [] [text movement.ItemName]
                span [attr.``class`` "muted"] [text movement.OccurredLabel]
            ]
            div [attr.``class`` "movement-bottomline"] [
                span [] [text (Domain.kindLabel movement.Kind + " " + string movement.Quantity)]
                span [attr.``class`` "muted"] [text ("by " + movement.ActorName)]
            ]
            p [attr.``class`` "movement-note muted"] [text movement.Note]
        ]

    let private inventoryCard (selectedItemId: Var<string>) (item: InventoryItem) =
        div [attr.``class`` "inventory-card"] [
            div [attr.``class`` "inventory-card-head"] [
                div [] [
                    p [attr.``class`` "inventory-sku"] [text item.Sku]
                    h3 [] [text item.Name]
                ]
                statusPill item
            ]
            div [attr.``class`` "inventory-meta"] [
                span [] [text (Domain.categoryLabel item.Category)]
                span [] [text item.Location]
                span [] [text item.Supplier]
            ]
            div [attr.``class`` "inventory-stats"] [
                div [] [
                    span [attr.``class`` "small-label"] [text "On hand"]
                    strong [] [text (string item.OnHand + " " + item.Unit)]
                ]
                div [] [
                    span [attr.``class`` "small-label"] [text "Reorder"]
                    strong [] [text (string item.ReorderLevel)]
                ]
                div [] [
                    span [attr.``class`` "small-label"] [text "Target"]
                    strong [] [text (string item.TargetStock)]
                ]
            ]
            button [
                attr.``class`` "ghost-button wide-button"
                on.click (fun _ _ -> selectedItemId.Set item.Id)
            ] [text "Select item"]
        ]

    let private viewSelectedItem (workspaceView: View<WorkspaceState>) (selectedItemIdView: View<string>) : View<option<InventoryItem>> =
        View.Map2 (fun (workspace: WorkspaceState) (selectedId: string) ->
            workspace.Inventory.Items |> List.tryFind (fun (item: InventoryItem) -> item.Id = selectedId)
        ) workspaceView selectedItemIdView

    let private selectedPanel (selectedItemView: View<option<InventoryItem>>) =
        selectedItemView
        |> View.Map (fun (selected: option<InventoryItem>) ->
            match selected with
            | None ->
                div [attr.``class`` "selected-placeholder"] [
                    h3 [] [text "Choose an item"]
                    p [] [text "Select a card from the inventory board to prefill the stock movement form."]
                ]
            | Some item ->
                let status = Domain.statusFor item
                div [attr.``class`` "selected-card"] [
                    div [attr.``class`` "selected-topline"] [
                        div [] [
                            h3 [] [text item.Name]
                            p [attr.``class`` "muted"] [text (item.Sku + " in " + item.Location)]
                        ]
                        span [attr.``class`` (Domain.statusCss status)] [text (Domain.statusLabel status)]
                    ]
                    div [attr.``class`` "selected-grid"] [
                        div [] [span [attr.``class`` "selected-label"] [text "On hand"]; strong [] [text (string item.OnHand + " " + item.Unit)]]
                        div [] [span [attr.``class`` "selected-label"] [text "Status"]; strong [] [text (Domain.statusLabel status)]]
                        div [] [span [attr.``class`` "selected-label"] [text "Supplier"]; strong [] [text item.Supplier]]
                        div [] [span [attr.``class`` "selected-label"] [text "Reorder"]; strong [] [text (string item.ReorderLevel)]]
                        div [] [span [attr.``class`` "selected-label"] [text "Target"]; strong [] [text (string item.TargetStock)]]
                    ]
                ])
        |> Doc.EmbedView

    let private alertsPanel (workspaceView: View<WorkspaceState>) (selectedItemId: Var<string>) =
        workspaceView
        |> View.Map (fun (workspace: WorkspaceState) ->
            let alerts =
                workspace.Inventory.Items
                |> List.filter (fun (item: InventoryItem) ->
                    match Domain.statusFor item with
                    | Critical
                    | Low -> true
                    | _ -> false
                )

            if List.isEmpty alerts then
                div [attr.``class`` "empty-note"] [text "No low-stock lines are currently flagged."]
            else
                alerts
                |> List.sortBy (fun (item: InventoryItem) -> item.OnHand)
                |> List.map (fun (item: InventoryItem) ->
                    let status = Domain.statusFor item
                    div [attr.``class`` "alert-item"] [
                        div [] [
                            strong [] [text item.Name]
                            p [attr.``class`` "muted"] [text ("Current " + string item.OnHand + " " + item.Unit + " / reorder " + string item.ReorderLevel)]
                        ]
                        div [attr.``class`` "alert-actions"] [
                            span [attr.``class`` (Domain.statusCss status)] [text (Domain.statusLabel status)]
                            a [
                                attr.``class`` "ghost-button alert-action-button"
                                attr.href "#operations-panel"
                                on.click (fun _ _ -> selectedItemId.Set item.Id)
                            ] [text (Domain.statusLabel status + " in operations")]
                        ]
                    ])
                |> Doc.Concat)
        |> Doc.EmbedView

    let private movementTimeline (workspaceView: View<WorkspaceState>) =
        workspaceView
        |> View.Map (fun (workspace: WorkspaceState) ->
            if List.isEmpty workspace.Inventory.RecentMovements then
                div [attr.``class`` "empty-note"] [text "No movement history yet."]
            else
                ul [attr.``class`` "movement-list"] (workspace.Inventory.RecentMovements |> List.map renderMovement))
        |> Doc.EmbedView

    let private roleBar (workspaceVar: Var<WorkspaceState>) (userIdVar: Var<string>) (statusVar: Var<string>) =
        let switchUser (userId: string) =
            async {
                let! workspace = Server.GetWorkspace userId
                userIdVar.Set userId
                workspaceVar.Set workspace
                statusVar.Set ("Switched to " + workspace.CurrentUser.Name + ".")
            }
            |> Async.StartImmediate

        div [attr.``class`` "panel role-panel"] [
            div [attr.``class`` "role-grid"] [
                div [] [
                    p [attr.``class`` "section-kicker"] [text "Workspace mode"]
                    h2 [] [textView (workspaceVar.View.Map(fun (ws: WorkspaceState) -> ws.CurrentUser.Name))]
                    p [attr.``class`` "muted"] [textView (workspaceVar.View.Map(fun (ws: WorkspaceState) -> ws.CurrentUser.Badge))]
                ]
                div [attr.``class`` "role-actions"] [
                    div [attr.``class`` "field-group compact"] [
                        label [] [text "User role"]
                        select [
                            attr.``class`` "search-select"
                            on.change (fun el _ -> switchUser (As<string> (el?value)))
                        ] [
                            Doc.BindView (fun (ws: WorkspaceState) ->
                                ws.Users
                                |> List.map (fun (user: AppUser) ->
                                    option [
                                        attr.value user.Id
                                        if user.Id = ws.CurrentUser.Id then attr.selected "selected"
                                    ] [text (user.Name + " - " + Domain.roleLabel user.Role)]
                                )
                                |> Doc.Concat
                            ) workspaceVar.View
                        ]
                    ]
                    div [attr.``class`` "role-pill-wrap"] [Doc.BindView (fun (ws: WorkspaceState) -> rolePill ws.CurrentUser) workspaceVar.View]
                ]
            ]
            div [attr.``class`` "permission-row"] [
                Doc.BindView (fun (ws: WorkspaceState) ->
                    Doc.Concat [
                        permissionChip ws.Permissions.CanMoveStock "Stock changes"
                        permissionChip ws.Permissions.CanImportCsv "CSV import"
                        permissionChip ws.Permissions.CanExportCsv "CSV export"
                        permissionChip ws.Permissions.CanResetDemo "Reset demo"
                        permissionChip ws.Permissions.CanManageUsers "User admin"
                    ]
                ) workspaceVar.View
            ]
        ]

    let private dashboard (workspaceView: View<WorkspaceState>) =
        div [attr.``class`` "metrics-grid"] [
            metricCard "metric-primary" "Units on hand" (View.Map (fun (ws: WorkspaceState) -> string ws.Inventory.Metrics.TotalUnits) workspaceView) (View.Map (fun (ws: WorkspaceState) -> string ws.Inventory.Metrics.TotalSkus + " tracked SKUs") workspaceView)
            metricCard "metric-warm" "Risk lines" (View.Map (fun (ws: WorkspaceState) -> string ws.Inventory.Metrics.LowStockCount) workspaceView) (View.Map (fun (ws: WorkspaceState) -> string ws.Inventory.Metrics.CriticalCount + " need urgent action") workspaceView)
            metricCard "metric-cool" "Outbound this month" (View.Map (fun (ws: WorkspaceState) -> string ws.Inventory.Metrics.MonthlyOutbound) workspaceView) (View.Map (fun (ws: WorkspaceState) -> string ws.Inventory.Metrics.OverstockCount + " overstocked items") workspaceView)
        ]

    let private inventoryBoard (workspaceView: View<WorkspaceState>) (searchVar: Var<string>) (categoryVar: Var<string>) (selectedItemId: Var<string>) =
        let cardsView =
            View.Map3 (fun (workspace: WorkspaceState) (searchText: string) (categoryText: string) ->
                let searchTerm = searchText.Trim().ToLower()
                let categoryFilter = asCategoryFilter categoryText

                let items =
                    workspace.Inventory.Items
                    |> List.filter (fun (item: InventoryItem) ->
                        let matchesSearch =
                            String.IsNullOrWhiteSpace searchTerm
                            || item.Name.ToLower().Contains(searchTerm)
                            || item.Sku.ToLower().Contains(searchTerm)
                            || item.Location.ToLower().Contains(searchTerm)
                            || item.Supplier.ToLower().Contains(searchTerm)

                        let matchesCategory =
                            match categoryFilter with
                            | None -> true
                            | Some category -> item.Category = category

                        matchesSearch && matchesCategory
                    )

                if List.isEmpty items then
                    div [attr.``class`` "empty-note"] [text "No items match the current filters."]
                else
                    div [attr.``class`` "inventory-board"] (items |> List.map (inventoryCard selectedItemId))
            ) workspaceView searchVar.View categoryVar.View

        div [attr.``class`` "panel"] [
            div [attr.``class`` "panel-head panel-head-stack"] [
                div [] [
                    p [attr.``class`` "section-kicker"] [text "Inventory"]
                    h2 [] [text "Inventory board"]
                    p [attr.``class`` "muted"] [text "Search stock by name, SKU, location, or supplier."]
                ]
                div [attr.``class`` "toolbar"] [
                    input [
                        attr.``class`` "search-input"
                        attr.placeholder "Search stock"
                        on.input (fun el _ -> searchVar.Set (As<string> (el?value)))
                    ] []
                    select [
                        attr.``class`` "search-select"
                        on.change (fun el _ -> categoryVar.Set (As<string> (el?value)))
                    ] (categoryOptions |> List.map (fun (value, labelText) -> option [attr.value value] [text labelText]))
                ]
            ]
            Doc.EmbedView cardsView
        ]

    let private commandPanel (workspaceVar: Var<WorkspaceState>) (userIdVar: Var<string>) (selectedItemId: Var<string>) (feedbackVar: Var<string>) =
        let selectedItemView = viewSelectedItem workspaceVar.View selectedItemId.View
        let actionVar = Var.Create "Issue"
        let quantityVar = Var.Create ""
        let noteVar = Var.Create ""
        let busyVar = Var.Create false

        let submitMovement () =
            async {
                match selectedItemId.Value, tryInt quantityVar.Value with
                | "", _ ->
                    feedbackVar.Set "Select an inventory item first."
                | _, None ->
                    feedbackVar.Set "Enter a valid quantity."
                | _, Some quantity ->
                    busyVar.Set true
                    let! result =
                        Server.SubmitMovement userIdVar.Value {
                            ItemId = selectedItemId.Value
                            Kind = asMovementKind actionVar.Value
                            Quantity = quantity
                            Note = noteVar.Value
                        }

                    busyVar.Set false

                    match result with
                    | Ok workspace ->
                        workspaceVar.Set workspace
                        feedbackVar.Set "Stock movement saved."
                        quantityVar.Set ""
                        noteVar.Set ""
                    | Error message ->
                        feedbackVar.Set message
            }
            |> Async.StartImmediate

        div [attr.``class`` "panel side-panel"; attr.id "operations-panel"] [
            div [attr.``class`` "panel-head panel-head-stack"] [
                div [] [
                    p [attr.``class`` "section-kicker"] [text "Operations"]
                    h2 [] [text "Stock console"]
                    p [attr.``class`` "muted"] [text "Managers, clerks, and administrators can record stock movement here."]
                ]
            ]
            selectedPanel selectedItemView
            Doc.BindView (fun (workspace: WorkspaceState) ->
                if workspace.Permissions.CanMoveStock then
                    div [] [
                        div [attr.``class`` "field-group"] [
                            label [] [text "Action"]
                            select [
                                attr.``class`` "search-select"
                                on.change (fun el _ -> actionVar.Set (As<string> (el?value)))
                            ] (actionOptions |> List.map (fun (value, labelText) -> option [attr.value value] [text labelText]))
                        ]
                        div [attr.``class`` "field-group"] [
                            label [] [text "Quantity"]
                            input [
                                attr.``class`` "search-input"
                                attr.placeholder "e.g. 8"
                                on.input (fun el _ -> quantityVar.Set (As<string> (el?value)))
                            ] []
                        ]
                        div [attr.``class`` "field-group"] [
                            label [] [text "Note"]
                            textarea [
                                attr.``class`` "note-box"
                                attr.placeholder "What happened to the stock?"
                                on.input (fun el _ -> noteVar.Set (As<string> (el?value)))
                            ] []
                        ]
                        button [
                            attr.``class`` "primary-button wide-button"
                            on.click (fun _ _ -> submitMovement ())
                        ] [
                            textView (busyVar.View.Map(fun busy -> if busy then "Saving..." else "Save movement"))
                        ]
                    ]
                else
                    div [attr.``class`` "read-only-box"] [
                        h3 [] [text "Read-only view"]
                        p [attr.``class`` "muted"] [text "This role can monitor inventory but cannot create stock movements."]
                    ]
            ) workspaceVar.View
            p [attr.``class`` "feedback"] [textView feedbackVar.View]
        ]

    let private userManagementPanel (workspaceVar: Var<WorkspaceState>) (userIdVar: Var<string>) (statusVar: Var<string>) =
        let createNameVar = Var.Create ""
        let createBadgeVar = Var.Create ""
        let createRoleVar = Var.Create "Viewer"
        let saveBusyVar = Var.Create false
        let deleteBusyVar = Var.Create false

        let resetCreateForm () =
            createNameVar.Set ""
            createBadgeVar.Set ""
            createRoleVar.Set "Viewer"

        let saveUser command successMessage =
            async {
                saveBusyVar.Set true
                let! result = Server.SaveUser userIdVar.Value command
                saveBusyVar.Set false

                match result with
                | Ok workspace ->
                    workspaceVar.Set workspace
                    statusVar.Set successMessage
                | Error message ->
                    statusVar.Set message
            }
            |> Async.StartImmediate

        let deleteUser (targetUserId: string) =
            async {
                deleteBusyVar.Set true
                let! result = Server.DeleteUser userIdVar.Value targetUserId
                deleteBusyVar.Set false

                match result with
                | Ok workspace ->
                    workspaceVar.Set workspace
                    statusVar.Set "User deleted successfully."
                | Error message ->
                    statusVar.Set message
            }
            |> Async.StartImmediate

        div [attr.``class`` "panel"] [
            div [attr.``class`` "panel-head panel-head-stack"] [
                div [] [
                    p [attr.``class`` "section-kicker"] [text "Admin"]
                    h2 [] [text "User management"]
                    p [attr.``class`` "muted"] [text "Administrators can create workers, update their details, change roles, and remove accounts."]
                ]
                button [
                    attr.``class`` "ghost-button"
                    on.click (fun _ _ -> resetCreateForm ())
                ] [text "New user"]
            ]
            Doc.BindView (fun (workspace: WorkspaceState) ->
                if workspace.Permissions.CanManageUsers then
                    let otherUsers =
                        workspace.Users
                        |> List.filter (fun user -> user.Id <> workspace.CurrentUser.Id)

                    div [attr.``class`` "user-admin-grid"] [
                        div [attr.``class`` "user-list"] [
                            div [attr.``class`` "user-editor user-create-card"] [
                                p [attr.``class`` "section-kicker"] [text "Create worker"]
                                div [attr.``class`` "field-group"] [
                                    label [] [text "Name"]
                                    input [
                                        attr.``class`` "search-input"
                                        attr.placeholder "Worker name"
                                        on.input (fun el _ -> createNameVar.Set (As<string> (el?value)))
                                    ] []
                                ]
                                div [attr.``class`` "field-group"] [
                                    label [] [text "Badge"]
                                    input [
                                        attr.``class`` "search-input"
                                        attr.placeholder "e.g. Warehouse Lead"
                                        on.input (fun el _ -> createBadgeVar.Set (As<string> (el?value)))
                                    ] []
                                ]
                                div [attr.``class`` "field-group"] [
                                    label [] [text "Role"]
                                    select [
                                        attr.``class`` "search-select"
                                        on.change (fun el _ -> createRoleVar.Set (As<string> (el?value)))
                                    ] (
                                        roleOptions
                                        |> List.map (fun (value, labelText) ->
                                            option [attr.value value] [text labelText])
                                    )
                                ]
                                div [attr.``class`` "user-editor-actions"] [
                                    button [
                                        attr.``class`` "primary-button"
                                        on.click (fun _ _ ->
                                            saveUser {
                                                UserId = ""
                                                Name = createNameVar.Value
                                                Badge = createBadgeVar.Value
                                                Role = asUserRole createRoleVar.Value
                                            } "User created successfully."
                                            resetCreateForm ())
                                    ] [
                                        textView (saveBusyVar.View.Map(fun busy -> if busy then "Saving..." else "Create user"))
                                    ]
                                ]
                            ]
                            if List.isEmpty otherUsers then
                                div [attr.``class`` "empty-note"] [text "No other workers are available yet."]
                            else
                                otherUsers
                                |> List.map (fun user ->
                                    let nameVar = Var.Create user.Name
                                    let badgeVar = Var.Create user.Badge
                                    let roleVar = Var.Create (Domain.roleLabel user.Role)
                                    div [attr.``class`` "user-row"] [
                                        div [attr.``class`` "user-row-fields"] [
                                            div [attr.``class`` "field-group compact"] [
                                                label [] [text "Name"]
                                                input [
                                                    attr.``class`` "search-input"
                                                    attr.value user.Name
                                                    on.input (fun el _ -> nameVar.Set (As<string> (el?value)))
                                                ] []
                                            ]
                                            div [attr.``class`` "field-group compact"] [
                                                label [] [text "Badge"]
                                                input [
                                                    attr.``class`` "search-input"
                                                    attr.value user.Badge
                                                    on.input (fun el _ -> badgeVar.Set (As<string> (el?value)))
                                                ] []
                                            ]
                                            div [attr.``class`` "field-group compact"] [
                                                label [] [text "Role"]
                                                select [
                                                    attr.``class`` "search-select"
                                                    on.change (fun el _ -> roleVar.Set (As<string> (el?value)))
                                                ] (
                                                    roleOptions
                                                    |> List.map (fun (value, labelText) ->
                                                        option [
                                                            attr.value value
                                                            if value = Domain.roleLabel user.Role then attr.selected "selected"
                                                        ] [text labelText])
                                                )
                                            ]
                                        ]
                                        div [attr.``class`` "user-row-actions"] [
                                            span [attr.``class`` (Domain.roleCss user.Role)] [text (Domain.roleLabel user.Role)]
                                            button [
                                                attr.``class`` "primary-button"
                                                on.click (fun _ _ ->
                                                    saveUser {
                                                        UserId = user.Id
                                                        Name = nameVar.Value
                                                        Badge = badgeVar.Value
                                                        Role = asUserRole roleVar.Value
                                                    } "User updated successfully.")
                                            ] [
                                                textView (saveBusyVar.View.Map(fun busy -> if busy then "Saving..." else "Save"))
                                            ]
                                            button [
                                                attr.``class`` "ghost-button user-delete-button"
                                                on.click (fun _ _ -> deleteUser user.Id)
                                            ] [
                                                textView (deleteBusyVar.View.Map(fun busy -> if busy then "Deleting..." else "Delete"))
                                            ]
                                        ]
                                    ])
                                |> Doc.Concat
                        ]
                    ]
                else
                    div [attr.``class`` "read-only-box"] [
                        h3 [] [text "Admin access required"]
                        p [attr.``class`` "muted"] [text "Switch to an administrator account to manage workers and change roles."]
                    ]
            ) workspaceVar.View
        ]

    let private csvPanel (workspaceVar: Var<WorkspaceState>) (userIdVar: Var<string>) (statusVar: Var<string>) =
        let csvVar = Var.Create ""
        let importBusyVar = Var.Create false
        let exportBusyVar = Var.Create false

        let exportCsv () =
            async {
                exportBusyVar.Set true
                let! result = Server.ExportCsv userIdVar.Value
                exportBusyVar.Set false

                match result with
                | Ok csv ->
                    downloadText "inventory-export.csv" csv
                    statusVar.Set "CSV export downloaded."
                | Error message ->
                    statusVar.Set message
            }
            |> Async.StartImmediate

        let importCsv () =
            async {
                if String.IsNullOrWhiteSpace csvVar.Value then
                    statusVar.Set "Paste CSV content or load a CSV file first."
                else
                    importBusyVar.Set true
                    let! result = Server.ImportCsv userIdVar.Value csvVar.Value
                    importBusyVar.Set false

                    match result with
                    | Ok importResult ->
                        workspaceVar.Set importResult.Workspace
                        csvVar.Set ""
                        statusVar.Set importResult.Message
                    | Error message ->
                        statusVar.Set message
            }
            |> Async.StartImmediate

        div [attr.``class`` "panel"] [
            div [attr.``class`` "panel-head panel-head-stack"] [
                div [] [
                    p [attr.``class`` "section-kicker"] [text "Data tools"]
                    h2 [] [text "CSV import and export"]
                    p [attr.``class`` "muted"] [text "This follows the familiar inventory-admin workflow: export the catalog, edit it in CSV, then re-import it."]
                ]
            ]
            Doc.BindView (fun (workspace: WorkspaceState) ->
                div [] [
                    div [attr.``class`` "csv-toolbar"] [
                        if workspace.Permissions.CanExportCsv then
                            button [
                                attr.``class`` "ghost-button"
                                on.click (fun _ _ -> exportCsv ())
                            ] [
                                textView (exportBusyVar.View.Map(fun busy -> if busy then "Preparing export..." else "Export CSV"))
                            ]
                        if workspace.Permissions.CanImportCsv then
                            label [attr.``class`` "file-button"] [
                                text "Load CSV file"
                                input [
                                    attr.``type`` "file"
                                    attr.accept ".csv,text/csv"
                                    on.change (fun el _ ->
                                        let file = firstFile (el?files)
                                        if not (isNull file) then
                                            readFileAsText file (fun fileText -> csvVar.Set fileText)
                                    )
                                ] []
                            ]
                    ]
                    textarea [
                        attr.``class`` "csv-box"
                        attr.placeholder "Paste CSV data here."
                        on.input (fun el _ -> csvVar.Set (As<string> (el?value)))
                    ] [textView csvVar.View]
                    div [attr.``class`` "csv-help muted"] [
                        text "Expected columns: "
                        code [] [text (workspace.CsvTemplate.Split('\n')[0])]
                    ]
                    if workspace.Permissions.CanImportCsv then
                        button [
                            attr.``class`` "primary-button"
                            on.click (fun _ _ -> importCsv ())
                        ] [
                            textView (importBusyVar.View.Map(fun busy -> if busy then "Importing..." else "Import CSV"))
                        ]
                    elif not workspace.Permissions.CanExportCsv then
                        div [attr.``class`` "read-only-box"] [
                            h3 [] [text "No CSV access"]
                            p [attr.``class`` "muted"] [text "Switch to a manager or administrator account to import catalog data."]
                        ]
                ]
            ) workspaceVar.View
        ]

    let private actionStrip (workspaceVar: Var<WorkspaceState>) (userIdVar: Var<string>) (statusVar: Var<string>) =
        let resetDemo () =
            async {
                let! result = Server.ResetDemoData userIdVar.Value
                match result with
                | Ok workspace ->
                    workspaceVar.Set workspace
                    statusVar.Set "Demo data reset."
                | Error message ->
                    statusVar.Set message
            }
            |> Async.StartImmediate

        div [attr.``class`` "hero-actions"] [
            Doc.BindView (fun (workspace: WorkspaceState) ->
                Doc.Concat [
                    if workspace.Permissions.CanExportCsv then
                        button [attr.``class`` "hero-button hero-button-secondary"; on.click (fun _ _ -> statusVar.Set "Use the CSV panel below to export the current inventory.")] [text "Open CSV tools"]
                    if workspace.Permissions.CanResetDemo then
                        button [attr.``class`` "hero-button"; on.click (fun _ _ -> resetDemo ())] [text "Reset demo data"]
                ]
            ) workspaceVar.View
        ]

    let private liveStatusDetail (workspaceView: View<WorkspaceState>) =
        workspaceView
        |> View.Map (fun (workspace: WorkspaceState) ->
            let metrics = workspace.Inventory.Metrics
            let roleName = Domain.roleLabel workspace.CurrentUser.Role

            if metrics.CriticalCount > 0 then
                a [attr.``class`` "hero-status-link"; attr.href "#attention-queue"] [
                    text (sprintf "%s view: %d critical item(s) need urgent attention and %d line(s) are below target." roleName metrics.CriticalCount metrics.LowStockCount)
                ]
            elif metrics.LowStockCount > 0 then
                a [attr.``class`` "hero-status-link"; attr.href "#attention-queue"] [
                    text (sprintf "%s view: %d low-stock line(s) need review and %d SKU(s) are being tracked." roleName metrics.LowStockCount metrics.TotalSkus)
                ]
            elif metrics.OverstockCount > 0 then
                span [] [text (sprintf "%s view: inventory is stable, with %d overstocked item(s) and %d unit(s) on hand." roleName metrics.OverstockCount metrics.TotalUnits)]
            else
                span [] [text (sprintf "%s view: inventory looks healthy across %d SKU(s), with %d unit(s) currently on hand." roleName metrics.TotalSkus metrics.TotalUnits)])
        |> Doc.EmbedView

    let private liveStatusGreeting (workspaceView: View<WorkspaceState>) =
        workspaceView
        |> View.Map (fun (workspace: WorkspaceState) ->
            sprintf "Hi %s, you're signed in as %s." workspace.CurrentUser.Name (Domain.roleLabel workspace.CurrentUser.Role))

    let Main () =
        let defaultUserId = "usr-1"
        let userIdVar = Var.Create defaultUserId
        let workspaceVar = Var.Create Domain.emptyWorkspace
        let searchVar = Var.Create ""
        let categoryVar = Var.Create ""
        let selectedItemId = Var.Create ""
        let statusVar = Var.Create "Loading workspace..."

        async {
            let! workspace = Server.GetWorkspace defaultUserId
            workspaceVar.Set workspace
            statusVar.Set "Workspace ready."
        }
        |> Async.StartImmediate

        div [attr.``class`` "shell"] [
            section [attr.``class`` "hero"] [
                div [attr.``class`` "hero-grid"] [
                    div [] [
                        p [attr.``class`` "eyebrow"] [text "Alpha Project Build"]
                        h1 [] [text "ShelfPilot Control Room"]
                        p [attr.``class`` "hero-copy"] [text "A more production-style WebSharper inventory workspace with role-aware access, CSV catalog operations, stock movement logging, and a responsive dashboard layout."]
                        actionStrip workspaceVar userIdVar statusVar
                    ]
                    div [attr.``class`` "hero-card"] [
                        p [attr.``class`` "section-kicker"] [text "Live status"]
                        p [attr.``class`` "hero-status"] [textView (liveStatusGreeting workspaceVar.View)]
                        p [attr.``class`` "hero-status-detail"] [textView statusVar.View]
                        div [attr.``class`` "hero-status-detail"] [liveStatusDetail workspaceVar.View]
                    ]
                ]
            ]
            roleBar workspaceVar userIdVar statusVar
            dashboard workspaceVar.View
            div [attr.``class`` "content-grid"] [
                div [attr.``class`` "main-stack"] [
                    inventoryBoard workspaceVar.View searchVar categoryVar selectedItemId
                    div [attr.``class`` "two-panel-grid"] [
                        div [attr.``class`` "panel"; attr.id "attention-queue"] [
                            div [attr.``class`` "panel-head panel-head-stack"] [
                                div [] [
                                    p [attr.``class`` "section-kicker"] [text "Exceptions"]
                                    h2 [] [text "Low-stock attention queue"]
                                ]
                            ]
                            alertsPanel workspaceVar.View selectedItemId
                        ]
                        div [attr.``class`` "panel"] [
                            div [attr.``class`` "panel-head panel-head-stack"] [
                                div [] [
                                    p [attr.``class`` "section-kicker"] [text "Activity"]
                                    h2 [] [text "Recent movements"]
                                ]
                            ]
                            movementTimeline workspaceVar.View
                        ]
                    ]
                    csvPanel workspaceVar userIdVar statusVar
                    userManagementPanel workspaceVar userIdVar statusVar
                ]
                commandPanel workspaceVar userIdVar selectedItemId statusVar
            ]
        ]
