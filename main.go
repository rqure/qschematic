package main

import (
	"net/http"
	"os"

	qdb "github.com/rqure/qdb/src"
)

func getDatabaseAddress() string {
	addr := os.Getenv("QDB_ADDR")
	if addr == "" {
		addr = "redis:6379"
	}

	return addr
}

func getWebServiceAddress() string {
	addr := os.Getenv("QDB_WEBSERVICE_ADDR")
	if addr == "" {
		addr = "0.0.0.0:20002"
	}

	return addr
}

func main() {
	db := qdb.NewRedisDatabase(qdb.RedisDatabaseConfig{
		Address: getDatabaseAddress(),
	})

	http.HandleFunc("/editor", func(wr http.ResponseWriter, r *http.Request) {
		http.ServeFile(wr, r, "./web/editor.html")
	})

	dbWorker := qdb.NewDatabaseWorker(db)
	webServiceWorker := qdb.NewWebServiceWorker(getWebServiceAddress())
	leaderElectionWorker := qdb.NewLeaderElectionWorker(db)

	schemaValidator := qdb.NewSchemaValidator(db)
	schemaValidator.AddEntity("SchematicController")
	schemaValidator.AddEntity("Schematic", "SourceFile")
	schemaValidator.AddEntity("SchematicModel", "SourceFile")

	dbWorker.Signals.SchemaUpdated.Connect(qdb.Slot(schemaValidator.ValidationRequired))
	dbWorker.Signals.Connected.Connect(qdb.Slot(schemaValidator.ValidationRequired))
	leaderElectionWorker.AddAvailabilityCriteria(func() bool {
		return dbWorker.IsConnected() && schemaValidator.IsValid()
	})

	dbWorker.Signals.Connected.Connect(qdb.Slot(leaderElectionWorker.OnDatabaseConnected))
	dbWorker.Signals.Disconnected.Connect(qdb.Slot(leaderElectionWorker.OnDatabaseDisconnected))

	// Create a new application configuration
	config := qdb.ApplicationConfig{
		Name: "schematic",
		Workers: []qdb.IWorker{
			dbWorker,
			leaderElectionWorker,
			webServiceWorker,
		},
	}

	// Create a new application
	app := qdb.NewApplication(config)

	// Execute the application
	app.Execute()
}
