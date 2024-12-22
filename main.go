package main

import (
	"net/http"
	"os"

	"github.com/rqure/qlib/pkg/app"
	"github.com/rqure/qlib/pkg/app/workers"
	"github.com/rqure/qlib/pkg/data/store"
)

func getStoreAddress() string {
	addr := os.Getenv("Q_ADDR")
	if addr == "" {
		addr = "ws://webgateway:20000/ws"
	}

	return addr
}

func getWebServiceAddress() string {
	addr := os.Getenv("Q_WEB_ADDR")
	if addr == "" {
		addr = "0.0.0.0:20002"
	}

	return addr
}

func main() {
	s := store.NewWeb(store.WebConfig{
		Address: getStoreAddress(),
	})

	http.HandleFunc("/editor", func(wr http.ResponseWriter, r *http.Request) {
		http.ServeFile(wr, r, "./web/editor.html")
	})

	storeWorker := workers.NewStore(s)
	webServiceWorker := workers.NewWeb(getWebServiceAddress())
	leadershipWorker := workers.NewLeadership(s)

	schemaValidator := leadershipWorker.GetEntityFieldValidator()
	schemaValidator.RegisterEntityFields("SchematicController")
	schemaValidator.RegisterEntityFields("Schematic", "SourceFile")
	schemaValidator.RegisterEntityFields("SchematicModel", "SourceFile")

	storeWorker.Connected.Connect(leadershipWorker.OnStoreConnected)
	storeWorker.Disconnected.Connect(leadershipWorker.OnStoreDisconnected)

	a := app.NewApplication("schematic")
	a.AddWorker(storeWorker)
	a.AddWorker(leadershipWorker)
	a.AddWorker(webServiceWorker)
	a.Execute()
}
