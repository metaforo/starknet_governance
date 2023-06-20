package controllers

import (
	// "github.com/beego/beego/v2/core/logs"

	"github.com/beego/beego/v2/core/config"
	"github.com/everFinance/goar"
	"github.com/everFinance/goar/types"
)

// Operations about object
type ARController struct {
	BaseController
}

type UploadToArweaveData struct {
	TxId string `json:"tx_id"`
}
type UploadToArweaveAPIReponse struct {
	Status      bool                `json:"status"`
	Code        int                 `json:"code"`
	Description string              `json:"description"`
	Data        UploadToArweaveData `json:"data"`
}

func (this *ARController) UploadToArweave() {
	// r_post_id := this.GetString("post_id")
	r_data := this.GetString("data")

	if len(r_data) <= 0 {
		this.Data["json"] = APIError(41020) // data can't be empty.
		this.ServeJSON()
	}

	arweave_keyfile_path, _ := config.String("arweave_keyfile_path")

	wallet, err := goar.NewWalletFromPath(arweave_keyfile_path, "https://arweave.net")

	if err != nil {
		panic(err)
	}

	tx, err := wallet.SendData(
		[]byte(r_data), // Data bytes
		[]types.Tag{
			types.Tag{
				Name:  "Content-Type",
				Value: "application/json",
			},
			// types.Tag{
			// 	Name:  "postId",
			// 	Value: r_post_id,
			// },
		},
	)

	if err != nil {
		this.Data["json"] = APIErrorWithLog(41021, err.Error()) // Arweave upload error.
		this.ServeJSON()
	}

	this.Data["json"] = UploadToArweaveAPIReponse{
		Status:      true,
		Code:        10000,
		Description: "success",
		Data:        UploadToArweaveData{TxId: tx.ID},
	}

	this.ServeJSON()
}
