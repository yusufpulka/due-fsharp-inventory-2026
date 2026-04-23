namespace InventoryAlpha

open System
open System.Text
open WebSharper

[<JavaScript>]
type Category =
    | Components
    | Office
    | Packaging
    | Safety
    | Electronics

[<JavaScript>]
type MovementKind =
    | Restock
    | Issue
    | Adjustment

[<JavaScript>]
type StockStatus =
    | Critical
    | Low
    | Healthy
    | Overstock

[<JavaScript>]
type UserRole =
    | Administrator
    | Manager
    | Clerk
    | Viewer

[<JavaScript>]
type InventoryItem =
    {
        Id: string
        Sku: string
        Name: string
        Category: Category
        Unit: string
        OnHand: int
        ReorderLevel: int
        TargetStock: int
        Supplier: string
        Location: string
        LastUpdated: DateTime
    }

[<JavaScript>]
type StockMovement =
    {
        Id: string
        ItemId: string
        ItemName: string
        Kind: MovementKind
        Quantity: int
        Note: string
        OccurredAt: DateTime
        OccurredLabel: string
        ActorName: string
    }

[<JavaScript>]
type DashboardMetrics =
    {
        TotalUnits: int
        TotalSkus: int
        LowStockCount: int
        CriticalCount: int
        MonthlyOutbound: int
        OverstockCount: int
    }

[<JavaScript>]
type InventorySnapshot =
    {
        Items: list<InventoryItem>
        RecentMovements: list<StockMovement>
        Metrics: DashboardMetrics
    }

[<JavaScript>]
type MovementCommand =
    {
        ItemId: string
        Kind: MovementKind
        Quantity: int
        Note: string
    }

[<JavaScript>]
type AppUser =
    {
        Id: string
        Name: string
        Role: UserRole
        Badge: string
    }

[<JavaScript>]
type UserPermissions =
    {
        CanMoveStock: bool
        CanImportCsv: bool
        CanExportCsv: bool
        CanResetDemo: bool
        CanManageUsers: bool
    }

[<JavaScript>]
type UserCommand =
    {
        UserId: string
        Name: string
        Role: UserRole
        Badge: string
    }

[<JavaScript>]
type WorkspaceState =
    {
        CurrentUser: AppUser
        Users: list<AppUser>
        Permissions: UserPermissions
        Inventory: InventorySnapshot
        CsvTemplate: string
    }

[<JavaScript>]
type CsvImportResult =
    {
        Workspace: WorkspaceState
        ImportedCount: int
        Message: string
    }

[<JavaScript>]
module Domain =

    let emptyPermissions =
        {
            CanMoveStock = false
            CanImportCsv = false
            CanExportCsv = false
            CanResetDemo = false
            CanManageUsers = false
        }

    let emptySnapshot =
        {
            Items = []
            RecentMovements = []
            Metrics =
                {
                    TotalUnits = 0
                    TotalSkus = 0
                    LowStockCount = 0
                    CriticalCount = 0
                    MonthlyOutbound = 0
                    OverstockCount = 0
                }
        }

    let fallbackUser =
        {
            Id = "viewer"
            Name = "Guest Viewer"
            Role = Viewer
            Badge = "Observing"
        }

    let emptyWorkspace =
        {
            CurrentUser = fallbackUser
            Users = [ fallbackUser ]
            Permissions = emptyPermissions
            Inventory = emptySnapshot
            CsvTemplate = ""
        }

    let categoryLabel =
        function
        | Components -> "Components"
        | Office -> "Office"
        | Packaging -> "Packaging"
        | Safety -> "Safety"
        | Electronics -> "Electronics"

    let parseCategory (value: string) =
        match value.Trim().ToLower() with
        | "components" -> Some Components
        | "office" -> Some Office
        | "packaging" -> Some Packaging
        | "safety" -> Some Safety
        | "electronics" -> Some Electronics
        | _ -> None

    let kindLabel =
        function
        | Restock -> "Restock"
        | Issue -> "Issue"
        | Adjustment -> "Adjustment"

    let roleLabel =
        function
        | Administrator -> "Administrator"
        | Manager -> "Manager"
        | Clerk -> "Clerk"
        | Viewer -> "Viewer"

    let roleCss =
        function
        | Administrator -> "role-pill role-admin"
        | Manager -> "role-pill role-manager"
        | Clerk -> "role-pill role-clerk"
        | Viewer -> "role-pill role-viewer"

    let parseRole (value: string) =
        match value.Trim().ToLower() with
        | "administrator" -> Some Administrator
        | "manager" -> Some Manager
        | "clerk" -> Some Clerk
        | "viewer" -> Some Viewer
        | _ -> None

    let permissionsFor role =
        match role with
        | Administrator ->
            {
                CanMoveStock = true
                CanImportCsv = true
                CanExportCsv = true
                CanResetDemo = true
                CanManageUsers = true
            }
        | Manager ->
            {
                CanMoveStock = true
                CanImportCsv = true
                CanExportCsv = true
                CanResetDemo = false
                CanManageUsers = false
            }
        | Clerk ->
            {
                CanMoveStock = true
                CanImportCsv = false
                CanExportCsv = true
                CanResetDemo = false
                CanManageUsers = false
            }
        | Viewer ->
            {
                CanMoveStock = false
                CanImportCsv = false
                CanExportCsv = false
                CanResetDemo = false
                CanManageUsers = false
            }

    let statusFor (item: InventoryItem) =
        if item.OnHand <= max 1 (item.ReorderLevel / 2) then
            Critical
        elif item.OnHand <= item.ReorderLevel then
            Low
        elif item.OnHand >= item.TargetStock + (item.TargetStock / 3) then
            Overstock
        else
            Healthy

    let statusLabel =
        function
        | Critical -> "Critical"
        | Low -> "Low"
        | Healthy -> "Healthy"
        | Overstock -> "Overstock"

    let statusCss =
        function
        | Critical -> "status status-critical"
        | Low -> "status status-low"
        | Healthy -> "status status-healthy"
        | Overstock -> "status status-overstock"

    let signedQuantity kind quantity =
        match kind with
        | Restock -> quantity
        | Issue -> -quantity
        | Adjustment -> quantity

    let applyMovement (whenUtc: DateTime) (command: MovementCommand) (item: InventoryItem) : InventoryItem =
        let delta = signedQuantity command.Kind command.Quantity

        {
            item with
                OnHand = item.OnHand + delta
                LastUpdated = whenUtc
        }

    let buildMetrics (today: DateTime) (items: list<InventoryItem>) (movements: list<StockMovement>) : DashboardMetrics =
        let thisMonth = today.Month
        let thisYear = today.Year

        let monthlyOutbound =
            movements
            |> List.filter (fun movement ->
                movement.Kind = Issue
                && movement.OccurredAt.Month = thisMonth
                && movement.OccurredAt.Year = thisYear
            )
            |> List.sumBy (fun movement -> movement.Quantity)

        let lowCount =
            items
            |> List.filter (fun item ->
                match statusFor item with
                | Critical
                | Low -> true
                | _ -> false
            )
            |> List.length

        let criticalCount =
            items
            |> List.filter (fun item -> statusFor item = Critical)
            |> List.length

        let overstockCount =
            items
            |> List.filter (fun item -> statusFor item = Overstock)
            |> List.length

        {
            TotalUnits = items |> List.sumBy (fun item -> item.OnHand)
            TotalSkus = items.Length
            LowStockCount = lowCount
            CriticalCount = criticalCount
            MonthlyOutbound = monthlyOutbound
            OverstockCount = overstockCount
        }

    let csvHeader =
        "Sku,Name,Category,Unit,OnHand,ReorderLevel,TargetStock,Supplier,Location"

    let escapeCsvCell (value: string) =
        let safe = value.Replace("\"", "\"\"")
        "\"" + safe + "\""

    let itemToCsvRow (item: InventoryItem) =
        [
            item.Sku
            item.Name
            categoryLabel item.Category
            item.Unit
            string item.OnHand
            string item.ReorderLevel
            string item.TargetStock
            item.Supplier
            item.Location
        ]
        |> List.map escapeCsvCell
        |> String.concat ","

    let exportCsv (items: list<InventoryItem>) =
        let builder = StringBuilder()
        builder.AppendLine(csvHeader) |> ignore
        items |> List.sortBy (fun item -> item.Name) |> List.iter (fun item -> builder.AppendLine(itemToCsvRow item) |> ignore)
        builder.ToString()
