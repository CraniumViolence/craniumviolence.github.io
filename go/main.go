package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"go.uber.org/zap"
)

var (
	league    = "Mirage"
	ZapLogger *zap.Logger
)

func init() {
	var err error
	ZapLogger, err = zap.NewDevelopment()
	if err != nil {
		ZapLogger.Named("Init").Fatal("Failed to create ZapLogger")
	}
}

const (
	EndpointTypeCurrency int = iota
	EndpointTypeItem
	EndpointTypeDivination
)

type APIEndpoint struct {
	EndpointURL  string
	EndpointType int
}

var APIEndpoints = map[string]APIEndpoint{
	// General
	"Currency":   {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/poe1/api/economy/exchange/current/overview?type=Currency&league="},
	"Astrolabe":  {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/poe1/api/economy/exchange/current/overview?type=Astrolabe&league="},
	"Fragment":   {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/poe1/api/economy/exchange/current/overview?type=Fragment&league="},
	"Incubator":  {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Incubator&league="},
	"DjinnCoin":  {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/poe1/api/economy/exchange/current/overview?type=DjinnCoin&league="},
	"Essence":    {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/poe1/api/economy/exchange/current/overview?type=Essence&league="},
	"Omen":       {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/poe1/api/economy/exchange/current/overview?type=Omen&league="},
	"Scarab":     {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/poe1/api/economy/exchange/current/overview?type=Scarab&league="},
	"Invitation": {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Invitation&league="},
	"Map":        {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Map&league="},
	"UniqueMap":  {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueMap&league="},
}

func main() {
	ZapLogger.Info("Main running")
	for endpointName, endPointDetails := range APIEndpoints {
		output := doJSONRequest(league, endPointDetails.EndpointURL)
		ZapLogger.Info("got json response", zap.Int("jsonLength", len(output)))
		// write returned json, removing first { and adding a modified date as a unix timestamp for ease
		os.WriteFile(endpointName+".json", append([]byte(fmt.Sprintf("{\"modified\":%d,", time.Now().Unix())), output[1:]...), 0644)
	}
}

func doJSONRequest(league string, endpoint string) []byte {
	client := &http.Client{}
	url := fmt.Sprintf("%s%s", endpoint, league)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		panic(err)
	}
	req.Header.Set("User-Agent", "PoeNinjaTools/1.0")
	q := req.URL.Query()
	req.URL.RawQuery = q.Encode()
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	return data
}
