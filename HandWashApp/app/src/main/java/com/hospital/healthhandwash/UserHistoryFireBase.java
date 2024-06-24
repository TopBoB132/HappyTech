package com.hospital.healthhandwash;

import java.util.List;

public class UserHistoryFireBase
{
    private String handWashDateTime;
    private int handWashPercentageSuccess;

    public UserHistoryFireBase() {}

    public UserHistoryFireBase(String handWashDateTime, int handWashPercentageSuccess)
    {
        this.handWashDateTime = handWashDateTime;
        this.handWashPercentageSuccess = handWashPercentageSuccess;
    }

    public String getHandWashDateTime() {return this.handWashDateTime;}
    public int getHandWashPercentageSuccess() {return this.handWashPercentageSuccess;}
}
