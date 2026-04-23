namespace InventoryAlpha

open WebSharper
open WebSharper.Sitelets
open WebSharper.UI.Server
open WebSharper.UI.Html

type EndPoint =
    | [<EndPoint "/">] Home

module Site =

    let private homePage _ =
        Content.Page(
            Title = "ShelfPilot Inventory Studio",
            Head = [
                meta [attr.charset "utf-8"] []
                meta [attr.name "viewport"; attr.content "width=device-width, initial-scale=1"] []
                link [attr.rel "stylesheet"; attr.href "/app.css"] []
            ],
            Body = [
                client <@ Client.Main() @>
            ]
        )

    [<Website>]
    let Main : Sitelet<EndPoint> =
        Sitelet.Content "/" Home homePage
