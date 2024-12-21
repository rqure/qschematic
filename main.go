package main

import (
	"net/http"
	"os"

	qdb "github.com/rqure/qdb/src"
	"github.com/rqure/qlib/pkg/app"
	"github.com/rqure/qlib/pkg/app/workers"
	"github.com/rqure/qlib/pkg/data/store"
)

func getDatabaseAddress() string {
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
	db := store.NewWeb(store.WebConfig{
		Address: getDatabaseAddress(),
	})

	http.HandleFunc("/editor", func(wr http.ResponseWriter, r *http.Request) {
		http.ServeFile(wr, r, "./web/editor.html")
	})

	storeWorker := workers.NewStore(db)
	webServiceWorker := qdb.NewWebServiceWorker(getWebServiceAddress())
	leadershipWorker := workers.NewLeadership(db)

	schemaValidator := leadershipWorker.GetEntityFieldValidator()
	schemaValidator.RegisterEntityFields("SchematicController")
	schemaValidator.RegisterEntityFields("Schematic", "SourceFile")
	schemaValidator.RegisterEntityFields("SchematicModel", "SourceFile")

	storeWorker.Connected.Connect(leadershipWorker.OnStoreConnected)
	storeWorker.Disconnected.Connect(leadershipWorker.OnStoreDisconnected)

	// Create a new application configuration
	config := qdb.ApplicationConfig{
		Name: "schematic",
		Workers: []qdb.IWorker{
			storeWorker,
			leadershipWorker,
			webServiceWorker,
		},
	}

	app := app.NewApplication(config)

	app.Execute()
}
