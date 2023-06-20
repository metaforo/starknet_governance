package main

import (
	_ "starknet_beego/routers"

	beego "github.com/beego/beego/v2/server/web"

	"github.com/beego/beego/v2/server/web/filter/cors"
)

func main() {
	// CORS for https://foo.* origins, allowing:
	// - PUT and PATCH methods
	// - Origin header
	// - Credentials share
	beego.InsertFilter("*", beego.BeforeRouter, cors.Allow(&cors.Options{
		// AllowOrigins:     []string{"https://*.foo.com"},
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	if beego.BConfig.RunMode == "dev" {
		beego.BConfig.WebConfig.DirectoryIndex = true
		beego.BConfig.WebConfig.StaticDir["/swagger"] = "swagger"
	}
	beego.Run()
}
