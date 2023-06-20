package controllers

import (
	"github.com/beego/beego/v2/core/logs"
	beego "github.com/beego/beego/v2/server/web"
)

type APIResponse struct {
	Status      bool   `json:"status"`
	Code        int    `json:"code"`
	Description string `json:"description"`
	// Server      string `json:"server"`
	Data string `json:"data"`
}

var APIErrorCodes = map[int]string{
	40001: "DB error",
	40002: "JWT error",
	40003: "Please login",

	41020: "data is required.",
	41021: "Arweave upload error.",
}

func APISuccess(data string) APIResponse {
	return APIResponse{Status: true, Code: 10000, Description: "success", Data: data}
}

func APIError(code int) APIResponse {
	return APIResponse{Status: false, Code: code, Description: APIErrorCodes[code]}
}

func APIErrorWithLog(code int, errMsg string) APIResponse {
	// If is dev mode, then display error msg to API response directly (for easier to see).
	if beego.BConfig.RunMode == "dev" {
		return APIResponse{Status: false, Code: code, Description: errMsg}
	}

	// If id prod mode, then log error msg, and only show msg in APIErrorCodes
	logs.Error(code, errMsg)

	return APIError(code)
}
