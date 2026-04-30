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

        // Use PORT from environment (Railway/Heroku) or default to 5064
        let port = System.Environment.GetEnvironmentVariable("PORT") |> fun p -> if p = null then "5064" else p
        app.Urls.Add($"http://0.0.0.0:{port}")

        if not (app.Environment.IsDevelopment()) then
            app.UseHsts() |> ignore

        // Disable HTTPS redirect in production (Railway handles SSL)
        // app.UseHttpsRedirection() |> ignore
        app.UseWebSharper(fun ws ->
            ws.UseSitelets(true) |> ignore
            ws.UseRemoting(true) |> ignore
            ws.Sitelet(Site.Main) |> ignore
        ) |> ignore
        app.UseStaticFiles() |> ignore

        app.Run()
        0
