package com.hospital.healthhandwash.Dialogs;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.graphics.drawable.ColorDrawable;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.TextView;

import com.google.firebase.database.DatabaseReference;
import com.hospital.healthhandwash.IsSharedHWTFB;
import com.hospital.healthhandwash.UserFireBase;
import com.hospital.healthhandwash.R;
import com.hospital.healthhandwash.UserHistoryFireBase;

import java.util.List;

public class HistoryShareDialog
{
    private Context context;
    private View vLayoutInflaterDialog;

    public HistoryShareDialog(Context context, View vLayoutInflaterDialog)
    {
        this.context = context;
        this.vLayoutInflaterDialog = vLayoutInflaterDialog;
    }
    public void showDialog(DatabaseReference reference)
    {
        AlertDialog.Builder builder = new AlertDialog.Builder(this.context, R.style.AlertDialogTheme);

        builder.setView(this.vLayoutInflaterDialog);
        ((TextView) this.vLayoutInflaterDialog.findViewById(R.id.textTitle)).setText(context.getResources().getString(R.string.share_history_title_dialog));
        ((TextView) this.vLayoutInflaterDialog.findViewById(R.id.textMessage)).setText(context.getResources().getString(R.string.share_history_text_dialog));
        ((Button) this.vLayoutInflaterDialog.findViewById(R.id.btnShare)).setText(context.getResources().getString(R.string.share_history_share_btn_dialog));
        ((Button) this.vLayoutInflaterDialog.findViewById(R.id.btnDeclineShare)).setText(context.getResources().getString(R.string.share_history_decline_btn_dialog));

        final AlertDialog alertDialog = builder.create();

        this.vLayoutInflaterDialog.findViewById(R.id.btnShare).setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view)
            {
                // TODO add isShareHistory to UUID default set to false here change to true
                IsSharedHWTFB sharedHWTFB = new IsSharedHWTFB("isSharedHWT",true);
                reference.child(sharedHWTFB.getKey());
                reference.setValue(sharedHWTFB.isShared());
                alertDialog.dismiss();
            }
        });

        this.vLayoutInflaterDialog.findViewById(R.id.btnDeclineShare).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view)
            {
                IsSharedHWTFB sharedHWTFB = new IsSharedHWTFB("isSharedHWT",false);
                reference.setValue(sharedHWTFB.isShared());
                alertDialog.dismiss();
            }
        });

        if(alertDialog.getWindow() != null)
        {
            alertDialog.getWindow().setBackgroundDrawable(new ColorDrawable(0));
        }

        if(!((Activity) context).isFinishing())
        {
            alertDialog.show();
        }
        alertDialog.setCanceledOnTouchOutside(false);
    }
}
