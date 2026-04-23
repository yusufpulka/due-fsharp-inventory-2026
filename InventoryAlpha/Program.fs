namespace InventoryAlpha

open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open WebSharper.AspNetCore

module Program =

    [<EntryPoint>]
    let main args =
        let builder = WebApplication.CreateBuilder(args)

        builder.Logging.ClearProviders() |> ignore
        builder.Logging.AddConsole() |> ignore
        builder.Services.AddWebSharper() |> ignore

        let app = builder.Build()

        if not (app.Environment.IsDevelopment()) then
            app.UseHsts() |> ignore

        app.UseHttpsRedirection() |> ignore
        app.UseWebSharper(fun ws ->
            ws.UseSitelets(true) |> ignore
            ws.UseRemoting(true) |> ignore
            ws.Sitelet(Site.Main) |> ignore
        ) |> ignore
        app.UseStaticFiles() |> ignore

        app.Run()
        0
