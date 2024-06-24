package com.hospital.healthhandwash;

public class HistoryListData
{
    private String Date, Time, SuccessPresent;

    public HistoryListData(String Date, String Time, String SuccessPresent)
    {
         this.Date = Date;
         this.Time = Time;
         this.SuccessPresent = SuccessPresent;
    }
    public String getDate() {return Date;}
    public String getTime() {return Time;}
    public String getSuccessPresent() {return SuccessPresent;}
}
