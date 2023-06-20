package controllers

import (

	// repo "starknet_beego/repositories"

	beego "github.com/beego/beego/v2/server/web"
)

// var IS_JWT_TOKEN_VALID bool = false
// var USER_ID int = 0

// var apis_not_need_jwt []string = []string{"/api/wallet/login", "/api/wallet/register"}

// func init() {
// 	// logs.Debug("base controller init")
// 	var FilterUser = func(ctx *context.Context) {

// 		// logs.Debug("before filter, RequestURI:", ctx.Request.RequestURI)
// 		// logs.Debug("before filter, jwt token:", ctx.Input.Query("jwt_token"))

// 		for _, api_not_need_jwt := range apis_not_need_jwt {
// 			is_ignore_jwt := strings.HasPrefix(ctx.Request.RequestURI, api_not_need_jwt)

// 			if is_ignore_jwt {
// 				logs.Debug("before filter, Ignore JWT!")
// 				return
// 			}
// 		}

// 		USER_ID, _ = repo.ValidateJWTToken(ctx.Input.Query("jwt_token"))

// 		// logs.Debug("USER_ID:", USER_ID)

// 		if USER_ID > 0 {
// 			IS_JWT_TOKEN_VALID = true
// 			// ctx.Redirect(302, "https://google.com")
// 		}
// 	}
// 	beego.InsertFilter("/*", beego.BeforeRouter, FilterUser)
// }

type BaseController struct {
	beego.Controller
}
