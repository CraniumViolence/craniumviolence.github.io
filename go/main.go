package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

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
	"Artifact":         {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=Artifact&league="},
	"Beast":            {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=Beast&league="},
	"BaseType":         {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=BaseType&league="},
	"ClusterJewel":     {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=ClusterJewel"},
	"Currency":         {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/api/data/currencyoverview?type=Currency&league="},
	"DeliriumOrb":      {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=DeliriumOrb&league="},
	"DivinationCard":   {EndpointType: EndpointTypeDivination, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=DivinationCard&league="},
	"Essence":          {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Essence&league="},
	"Fossil":           {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Fossil&league="},
	"Fragment":         {EndpointType: EndpointTypeCurrency, EndpointURL: "https://poe.ninja/api/data/currencyoverview?type=Fragment&league="},
	"Incubator":        {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Incubator&league="},
	"Invitation":       {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=Invitation&league="},
	"Map":              {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Map&league="},
	"Memory":           {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Memory&league="},
	"BlightedMap":      {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=BlightedMap&league="},
	"BlightRavagedMap": {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=BlightRavagedMap&league="},
	"Oil":              {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Oil&league="},
	"Omen":             {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=Omen&league="},
	"Prophecy":         {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Prophecy&league="},
	"Resonator":        {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Resonator&league="},
	"Scarab":           {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Scarab&league="},
	"SkillGem":         {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=SkillGem&league="},
	"UniqueAccessory":  {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueAccessory&league="},
	"UniqueArmour":     {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueArmour&league="},
	"UniqueFlask":      {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueFlask&league="},
	"UniqueJewel":      {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueJewel&league="},
	"UniqueMap":        {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueMap&league="},
	"UniqueWeapon":     {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueWeapon&league="},
	"UniqueRelic":      {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=UniqueRelic&league="},
	"Vial":             {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=Vial&league="},

	// Current league
	"KalguuranRune": {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/itemoverview?type=KalguuranRune&league="},
	"Tattoo":        {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=Tattoo&league="},

	// Standard legacy endpoint
	"HelmetEnchant": {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=HelmetEnchant&league="},

	// Old League Historical
	"Coffin":   {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=Coffin&league="},
	"Allflame": {EndpointType: EndpointTypeItem, EndpointURL: "https://poe.ninja/api/data/ItemOverview?type=AllflameEmber&league="},
}

func main() {
	var leagueName, endPointName, outputFile string
	if len(os.Args) == 4 {
		leagueName = os.Args[1]
		endPointName = os.Args[2]
		outputFile = os.Args[3]
	} else {
		panic("missing arguments")
	}

	var ok bool
	var endPointDetails APIEndpoint
	if endPointDetails, ok = APIEndpoints[endPointName]; !ok {
		panic("invalid endpoint entered")
	}
	output := doJSONRequest(leagueName, endPointDetails.EndpointURL)

	// write returned json
	os.WriteFile(outputFile, output, 0644)
}

func doJSONRequest(league string, endpoint string) []byte {
	// set up http client and request json
	client := &http.Client{}
	url := fmt.Sprintf("%s%s", endpoint, league)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		os.Exit(1)
	}
	req.Header.Set("User-Agent", "PoeNinjaTools/1.0")
	q := req.URL.Query()
	req.URL.RawQuery = q.Encode()

	// Request data
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	// Return data
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	return data
}
