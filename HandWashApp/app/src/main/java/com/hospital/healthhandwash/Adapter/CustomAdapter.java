package com.hospital.healthhandwash.Adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.hospital.healthhandwash.HistoryListData;
import com.hospital.healthhandwash.R;

import java.util.ArrayList;
import java.util.List;

public class CustomAdapter extends ArrayAdapter<HistoryListData>
{
    public CustomAdapter(Context context, int resource, List<HistoryListData> dataHistoryArrayList)
    {
        super(context, resource, dataHistoryArrayList);
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent)
    {
        HistoryListData listData = getItem(position);

        if (convertView == null)
        {
            LayoutInflater inflater = LayoutInflater.from(getContext());
            convertView = inflater.inflate(R.layout.handwash_times_history_list, parent, false);
        }

        TextView tv_custom_list_date = convertView.findViewById(R.id.tv_custom_list_date);
        TextView tv_custom_list_time = convertView.findViewById(R.id.tv_custom_list_time);
        TextView tv_custom_list_success_present = convertView.findViewById(R.id.tv_custom_list_success_present);

        tv_custom_list_date.setText(listData.getDate());
        tv_custom_list_time.setText(listData.getTime());
        tv_custom_list_success_present.setText(listData.getSuccessPresent());

        return convertView;
    }
}
