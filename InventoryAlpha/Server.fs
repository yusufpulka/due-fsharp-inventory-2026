namespace InventoryAlpha

open System
open WebSharper

module private Seed =

    let private now =
        DateTime.UtcNow

    let user id name role badge : AppUser =
        {
            Id = id
            Name = name
            Role = role
            Badge = badge
        }

    let item id sku name category unit onHand reorderLevel targetStock supplier location daysAgo : InventoryItem =
        {
            Id = id
            Sku = sku
            Name = name
            Category = category
            Unit = unit
            OnHand = onHand
            ReorderLevel = reorderLevel
            TargetStock = targetStock
            Supplier = supplier
            Location = location
            LastUpdated = now.AddDays(float -daysAgo)
        }

    let initialUsers =
        [
            user "usr-1" "Maya Chen" Administrator "Ops Director"
            user "usr-2" "Jonas Reed" Manager "Warehouse Lead"
            user "usr-3" "Rina Patel" Clerk "Fulfilment Clerk"
            user "usr-4" "Leo Santos" Viewer "Finance Viewer"
        ]

    let initialItems =
        [
            item "itm-1" "CMP-1001" "Resistor Kit 1k-10k" Components "kits" 14 8 24 "Volt City" "A1-02" 1
            item "itm-2" "CMP-2044" "Breadboard Jumpers" Components "packs" 5 6 16 "Lab Source" "A1-07" 2
            item "itm-3" "OFF-1190" "Shipping Labels" Office "rolls" 11 5 15 "Paper Nest" "B3-01" 3
            item "itm-4" "PKG-2210" "Padded Mailers" Packaging "boxes" 7 6 20 "WrapWorks" "B2-02" 1
            item "itm-5" "SAF-0099" "Nitrile Gloves" Safety "boxes" 3 4 12 "SafeSupply" "C1-01" 0
            item "itm-6" "ELC-4400" "USB-C Power Meter" Electronics "units" 9 3 10 "Bench Lane" "D4-03" 4
            item "itm-7" "ELC-5541" "Microcontroller Boards" Electronics "units" 18 8 24 "Proto Hub" "D1-08" 2
            item "itm-8" "PKG-1124" "Tamper Seals" Packaging "packs" 26 10 24 "WrapWorks" "B2-05" 1
        ]

    let movement id itemId itemName kind quantity note actorName hoursAgo : StockMovement =
        let at = now.AddHours(float -hoursAgo)

        {
            Id = id
            ItemId = itemId
            ItemName = itemName
            Kind = kind
            Quantity = quantity
            Note = note
            ActorName = actorName
            OccurredAt = at
            OccurredLabel = at.ToLocalTime().ToString("dd MMM HH:mm")
        }

    let initialMovements =
        [
            movement "mov-1" "itm-5" "Nitrile Gloves" Issue 2 "Workshop checkout" "Rina Patel" 6
            movement "mov-2" "itm-2" "Breadboard Jumpers" Issue 4 "Alpha lab setup" "Rina Patel" 11
            movement "mov-3" "itm-8" "Tamper Seals" Restock 8 "Vendor top-up" "Jonas Reed" 18
            movement "mov-4" "itm-1" "Resistor Kit 1k-10k" Issue 3 "Student prototype bin" "Jonas Reed" 26
            movement "mov-5" "itm-6" "USB-C Power Meter" Adjustment 1 "Count reconciliation" "Maya Chen" 40
        ]

type private StoreState =
    {
        Items: Map<string, InventoryItem>
        Users: Map<string, AppUser>
        Movements: list<StockMovement>
    }

module private Csv =

    let private splitCsvRow (line: string) =
        let cells = ResizeArray<string>()
        let current = System.Text.StringBuilder()
        let mutable index = 0
        let mutable inQuotes = false

        while index < line.Length do
            let ch = line[index]

            if inQuotes then
                if ch = '"' then
                    if index + 1 < line.Length && line[index + 1] = '"' then
                        current.Append('"') |> ignore
                        index <- index + 1
                    else
                        inQuotes <- false
                else
                    current.Append(ch) |> ignore
            else
                match ch with
                | '"' -> inQuotes <- true
                | ',' ->
                    cells.Add(current.ToString().Trim())
                    current.Clear() |> ignore
                | _ ->
                    current.Append(ch) |> ignore

            index <- index + 1

        cells.Add(current.ToString().Trim())
        cells |> Seq.toList

    let private parseItemRow lineNumber (cells: list<string>) =
        match cells with
        | [ sku; name; categoryText; unit; onHandText; reorderText; targetText; supplier; location ] ->
            match Domain.parseCategory categoryText with
            | None -> Error (sprintf "Row %d has an unknown category: %s" lineNumber categoryText)
            | Some category ->
                match Int32.TryParse(onHandText), Int32.TryParse(reorderText), Int32.TryParse(targetText) with
                | (true, onHand), (true, reorderLevel), (true, targetStock) ->
                    if String.IsNullOrWhiteSpace sku || String.IsNullOrWhiteSpace name then
                        Error (sprintf "Row %d is missing a SKU or item name." lineNumber)
                    else
                        Ok
                            {
                                Id = "csv-" + Guid.NewGuid().ToString("N")
                                Sku = sku.Trim()
                                Name = name.Trim()
                                Category = category
                                Unit = if String.IsNullOrWhiteSpace unit then "units" else unit.Trim()
                                OnHand = onHand
                                ReorderLevel = reorderLevel
                                TargetStock = targetStock
                                Supplier = supplier.Trim()
                                Location = location.Trim()
                                LastUpdated = DateTime.UtcNow
                            }
                | _ ->
                    Error (sprintf "Row %d must contain whole numbers for OnHand, ReorderLevel, and TargetStock." lineNumber)
        | _ ->
            Error (sprintf "Row %d does not match the expected 9-column CSV format." lineNumber)

    let parseItems (csvText: string) =
        let lines =
            csvText.Replace("\r\n", "\n").Split('\n', StringSplitOptions.RemoveEmptyEntries)
            |> Array.map (fun line -> line.Trim())
            |> Array.filter (fun line -> not (String.IsNullOrWhiteSpace line))
            |> Array.toList

        match lines with
        | [] -> Error "Paste a CSV file before importing."
        | _header :: rows ->
            let parsed =
                rows
                |> List.mapi (fun index line -> parseItemRow (index + 2) (splitCsvRow line))

            let errors =
                parsed
                |> List.choose (function | Error error -> Some error | _ -> None)

            if not (List.isEmpty errors) then
                Error (String.concat " " errors)
            else
                parsed
                |> List.choose (function | Ok item -> Some item | _ -> None)
                |> fun items ->
                    if List.isEmpty items then
                        Error "No inventory rows were found in the CSV."
                    else
                        Ok items

module private Store =

    let private gate = obj ()

    let private countAdministrators (users: Map<string, AppUser>) =
        users
        |> Map.toList
        |> List.sumBy (fun (_, user) -> if user.Role = Administrator then 1 else 0)

    let private initialState () =
        {
            Items = Seed.initialItems |> List.map (fun item -> item.Id, item) |> Map.ofList
            Users = Seed.initialUsers |> List.map (fun user -> user.Id, user) |> Map.ofList
            Movements = Seed.initialMovements
        }

    let mutable private state = initialState ()

    let private inventorySnapshot (current: StoreState) : InventorySnapshot =
        let items =
            current.Items
            |> Map.toList
            |> List.map snd
            |> List.sortBy (fun item -> item.Name)

        {
            Items = items
            RecentMovements = current.Movements |> List.sortByDescending (fun movement -> movement.OccurredAt) |> List.truncate 10
            Metrics = Domain.buildMetrics DateTime.UtcNow items current.Movements
        }

    let private csvTemplate current =
        current.Items
        |> Map.toList
        |> List.map snd
        |> Domain.exportCsv

    let private resolveUser actorId current =
        Map.tryFind actorId current.Users
        |> Option.defaultValue (current.Users |> Map.toList |> List.map snd |> List.tryHead |> Option.defaultValue Domain.fallbackUser)

    let private workspace actorId current =
        let currentUser = resolveUser actorId current

        {
            CurrentUser = currentUser
            Users = current.Users |> Map.toList |> List.map snd |> List.sortBy (fun user -> user.Name)
            Permissions = Domain.permissionsFor currentUser.Role
            Inventory = inventorySnapshot current
            CsvTemplate = csvTemplate current
        }

    let readWorkspace actorId =
        lock gate (fun () -> workspace actorId state)

    let reset actorId =
        lock gate (fun () ->
            let actor = resolveUser actorId state
            let permissions = Domain.permissionsFor actor.Role

            if not permissions.CanResetDemo then
                Error "Only administrators can reset the demo workspace."
            else
                state <- initialState ()
                Ok (workspace actorId state)
        )

    let saveUser actorId (command: UserCommand) =
        lock gate (fun () ->
            let actor = resolveUser actorId state
            let permissions = Domain.permissionsFor actor.Role
            let trimmedName = command.Name.Trim()
            let trimmedBadge = command.Badge.Trim()

            if not permissions.CanManageUsers then
                Error "Only administrators can manage users."
            elif String.IsNullOrWhiteSpace trimmedName then
                Error "User name is required."
            elif String.IsNullOrWhiteSpace trimmedBadge then
                Error "User badge is required."
            elif command.UserId = actorId && command.Role <> actor.Role then
                Error "Administrators cannot change their own role here."
            else
                let updatedUser =
                    {
                        Id =
                            if String.IsNullOrWhiteSpace command.UserId then
                                "usr-" + Guid.NewGuid().ToString("N")
                            else
                                command.UserId
                        Name = trimmedName
                        Role = command.Role
                        Badge = trimmedBadge
                    }

                match String.IsNullOrWhiteSpace command.UserId, Map.tryFind command.UserId state.Users with
                | false, None ->
                    Error "That user could not be found."
                | _ ->
                    let previousRole =
                        Map.tryFind updatedUser.Id state.Users
                        |> Option.map (fun user -> user.Role)

                    let updatedUsers = state.Users |> Map.add updatedUser.Id updatedUser
                    let adminCountAfter = countAdministrators updatedUsers

                    if previousRole = Some Administrator && updatedUser.Role <> Administrator && adminCountAfter = 0 then
                        Error "At least one administrator must remain in the workspace."
                    else
                        state <- { state with Users = updatedUsers }
                        Ok (workspace actorId state)
        )

    let deleteUser actorId targetUserId =
        lock gate (fun () ->
            let actor = resolveUser actorId state
            let permissions = Domain.permissionsFor actor.Role

            if not permissions.CanManageUsers then
                Error "Only administrators can manage users."
            elif String.IsNullOrWhiteSpace targetUserId then
                Error "Pick a user to delete."
            elif targetUserId = actorId then
                Error "Administrators cannot delete their own account."
            else
                match Map.tryFind targetUserId state.Users with
                | None ->
                    Error "That user could not be found."
                | Some targetUser ->
                    let remainingUsers = state.Users |> Map.remove targetUserId

                    if targetUser.Role = Administrator && countAdministrators remainingUsers = 0 then
                        Error "At least one administrator must remain in the workspace."
                    else
                        state <- { state with Users = remainingUsers }
                        Ok (workspace actorId state)
        )

    let submit actorId (command: MovementCommand) =
        lock gate (fun () ->
            let actor = resolveUser actorId state
            let permissions = Domain.permissionsFor actor.Role

            if not permissions.CanMoveStock then
                Error "This role is read-only and cannot change stock."
            elif String.IsNullOrWhiteSpace command.ItemId then
                Error "Pick an inventory item before submitting a movement."
            elif command.Quantity <= 0 then
                Error "Quantity must be greater than zero."
            else
                match Map.tryFind command.ItemId state.Items with
                | None -> Error "That item could not be found."
                | Some currentItem ->
                    let updatedItem = Domain.applyMovement DateTime.UtcNow command currentItem

                    if updatedItem.OnHand < 0 then
                        Error "This movement would push stock below zero."
                    else
                        let now = DateTime.UtcNow
                        let movement =
                            {
                                Id = Guid.NewGuid().ToString("N")
                                ItemId = currentItem.Id
                                ItemName = currentItem.Name
                                Kind = command.Kind
                                Quantity = command.Quantity
                                Note =
                                    if String.IsNullOrWhiteSpace command.Note then
                                        "Recorded from stock console"
                                    else
                                        command.Note.Trim()
                                ActorName = actor.Name
                                OccurredAt = now
                                OccurredLabel = now.ToLocalTime().ToString("dd MMM HH:mm")
                            }

                        state <-
                            {
                                state with
                                    Items = state.Items |> Map.add currentItem.Id updatedItem
                                    Movements = movement :: state.Movements
                            }

                        Ok (workspace actorId state)
        )

    let export actorId =
        lock gate (fun () ->
            let actor = resolveUser actorId state
            let permissions = Domain.permissionsFor actor.Role

            if not permissions.CanExportCsv then
                Error "This role does not have CSV export permission."
            else
                state.Items
                |> Map.toList
                |> List.map snd
                |> Domain.exportCsv
                |> Ok
        )

    let importCsv actorId (csvText: string) =
        lock gate (fun () ->
            let actor = resolveUser actorId state
            let permissions = Domain.permissionsFor actor.Role

            if not permissions.CanImportCsv then
                Error "Only managers and administrators can import CSV data."
            else
                match Csv.parseItems csvText with
                | Error message -> Error message
                | Ok items ->
                    let importedItems =
                        items
                        |> List.mapi (fun index item ->
                            let stableId = "imp-" + string (index + 1)
                            { item with Id = stableId }
                        )

                    let importedMap =
                        importedItems |> List.map (fun item -> item.Id, item) |> Map.ofList

                    let importMovements =
                        importedItems
                        |> List.map (fun item ->
                            let now = DateTime.UtcNow
                            {
                                Id = Guid.NewGuid().ToString("N")
                                ItemId = item.Id
                                ItemName = item.Name
                                Kind = Adjustment
                                Quantity = item.OnHand
                                Note = "Catalog synced from CSV import"
                                ActorName = actor.Name
                                OccurredAt = now
                                OccurredLabel = now.ToLocalTime().ToString("dd MMM HH:mm")
                            }
                        )

                    state <-
                        {
                            state with
                                Items = importedMap
                                Movements = importMovements
                        }

                    Ok
                        {
                            Workspace = workspace actorId state
                            ImportedCount = items.Length
                            Message = sprintf "Imported %d inventory rows from CSV." items.Length
                        }
        )

module Server =

    [<Rpc>]
    let GetWorkspace (actorId: string) : Async<WorkspaceState> =
        async { return Store.readWorkspace actorId }

    [<Rpc>]
    let SubmitMovement (actorId: string) (command: MovementCommand) : Async<Result<WorkspaceState, string>> =
        async { return Store.submit actorId command }

    [<Rpc>]
    let ExportCsv (actorId: string) : Async<Result<string, string>> =
        async { return Store.export actorId }

    [<Rpc>]
    let ImportCsv (actorId: string) (csvText: string) : Async<Result<CsvImportResult, string>> =
        async { return Store.importCsv actorId csvText }

    [<Rpc>]
    let ResetDemoData (actorId: string) : Async<Result<WorkspaceState, string>> =
        async { return Store.reset actorId }

    [<Rpc>]
    let SaveUser (actorId: string) (command: UserCommand) : Async<Result<WorkspaceState, string>> =
        async { return Store.saveUser actorId command }

    [<Rpc>]
    let DeleteUser (actorId: string) (targetUserId: string) : Async<Result<WorkspaceState, string>> =
        async { return Store.deleteUser actorId targetUserId }
