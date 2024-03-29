package main

import (
    "encoding/csv"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "strings"
)

type Data struct {
    Rid         string `json:"rid"`
    VisitorID   string `json:"visitorId"`
    SessionID   string `json:"sessionId"`
    StartDate   string `json:"startDate,omitempty"`
    Timezone    string `json:"timezone,omitempty"`
    ElapsedTime string `json:"elapsedTime,omitempty"`
    SRCAddress  string `json:"srcAddress,omitempty"`
}

func writeData(c chan Data, csvwriter *csv.Writer) {
    for {
        data := <-c
        err := csvwriter.Write([]string{data.Rid, data.VisitorID, data.SessionID, data.StartDate, data.Timezone, data.ElapsedTime, data.SRCAddress})
        csvwriter.Flush()
        if err != nil {
            log.Println(err)
        }
    }
}

func main() {

    if len(os.Args) != 3 {
        fmt.Println("Usage: ./program.exe <outfile> <port>")
        os.Exit(1)
    }

    _, err := os.Stat(os.Args[1])
    newFile := err != nil

    f, err := os.OpenFile(os.Args[1], os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        log.Println(err)
        os.Exit(1)
    }
    defer f.Close()

    csvwriter := csv.NewWriter(f)
    if newFile {
        csvwriter.Write([]string{"Rid", "Visitor ID", "Session ID", "Start Date", "Timezone", "Elapsed Time", "Source Address"})
        csvwriter.Flush()
    }

    dataCh := make(chan Data, 1)
    go writeData(dataCh, csvwriter)

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        var data Data
        var jsonOk bool = true
        var formOk bool = true

        // Loop over header names
        // for name, values := range r.Header {
        //     // Loop over all values for the name.
        //     for _, value := range values {
        //         fmt.Println(name, value)
        //     }
        // }

        if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
            // is not json...
            jsonOk = false
            data.Rid = r.Form.Get("rid")
            data.VisitorID = r.Form.Get("visitorId")
            data.SessionID = r.Form.Get("sessionId")
            data.StartDate = r.Form.Get("startDate")
            data.Timezone = r.Form.Get("timezone")
            data.ElapsedTime = r.Form.Get("elapsedTime")
            if data.Rid == "" || data.VisitorID == "" {
                // is not form either
                formOk = false
            }
        }

        if !jsonOk && !formOk {
            w.WriteHeader(http.StatusInternalServerError)
        }

        // Either json or form data has been parsed
        fmt.Println("Got an hit!")
        data.SRCAddress = strings.Join(r.Header["X-Forwarded-For"], "")
        dataCh <- data
    })

    fmt.Printf("[+] Server is runing at port %v\n", os.Args[2])
    http.ListenAndServe(fmt.Sprintf(":%v", os.Args[2]), nil)
}
