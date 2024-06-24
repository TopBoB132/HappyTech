package com.hospital.healthhandwash;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.hospital.healthhandwash.Adapter.CustomAdapter;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class HistoryScreen extends AppCompatActivity implements ValueEventListener {

    private SharedPreferences sharedPref;
    private ListView lv_handwash_times_history;
    private ArrayList<HistoryListData> handWashTimesHistoryList;
    private CustomAdapter customAdapter;
    private HistoryListData historyListData;
    private FirebaseDatabase database;
    private DatabaseReference reference;
    private String user_uid;
    private final String KEY_HAND_WASH_HISTORY_TIMES = "HandWashHistory";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.history_screen);

        this.init();

        this.reference.addValueEventListener(this);
        this.lv_handwash_times_history.setAdapter(this.customAdapter);
        this.customAdapter.notifyDataSetChanged();
    }

    private void init() {
        // Shared preferences
        this.sharedPref = getSharedPreferences(String.valueOf(R.string.shared_pref_file_name), MODE_PRIVATE);

        // attributes
        this.lv_handwash_times_history = findViewById(R.id.lv_handwash_times_history);

        // firebase
        this.database = FirebaseDatabase.getInstance();
        this.user_uid = this.sharedPref.getString(String.valueOf(R.string.shared_pref_user_uid), "");
        this.reference = this.database.getReference("users").child(this.user_uid).child(KEY_HAND_WASH_HISTORY_TIMES);

        // Initialize handWashTimesHistoryList
        this.handWashTimesHistoryList = new ArrayList<>();
        this.historyListData = new HistoryListData("", "", "");
        this.handWashTimesHistoryList.add(this.historyListData);

        // Use the custom adapter
        this.customAdapter = new CustomAdapter(this, R.layout.handwash_times_history_list, this.handWashTimesHistoryList);
    }

    @Override
    public void onDataChange(@NonNull DataSnapshot snapshot)
    {
        // Clear existing data
        this.handWashTimesHistoryList.clear();

        for (DataSnapshot childSnapshot : snapshot.getChildren())
        {
            String dateTime = childSnapshot.getKey();
            String successPercentObject = "Wash Success: " + childSnapshot.getValue(Integer.class) + "%";  // Value can be Long or String

            // Split date and time
            String[] dateTimeArray = dateTime.split(" ");
            String date = "Date: " + dateTimeArray[0];
            String time = "Time: " + dateTimeArray[1];

            // Create HistoryListData object and add to the list
            HistoryListData historyData = new HistoryListData(date, time, successPercentObject);
            this.handWashTimesHistoryList.add(historyData);
        }

        // Reverse the list
        Collections.reverse(this.handWashTimesHistoryList);

        // Notify the adapter that the data has changed
        this.customAdapter.notifyDataSetChanged();
    }

    @Override
    public void onCancelled(@NonNull DatabaseError error) {}
}
