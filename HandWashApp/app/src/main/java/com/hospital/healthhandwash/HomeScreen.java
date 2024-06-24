package com.hospital.healthhandwash;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.hospital.healthhandwash.Dialogs.HistoryShareDialog;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
public class HomeScreen extends AppCompatActivity implements View.OnClickListener,
        ValueEventListener, PopupMenu.OnMenuItemClickListener
{
    private SharedPreferences sharedPref;
    private SharedPreferences.Editor editor;
    private TextView tv_handwash_times, tv_welcome, tv_isManager_state, tv_isHistoryShared_state;
    private Button btn_exit_shift;
    private ImageButton btnImg_settings;
    private String profession;
    private FirebaseDatabase database;
    private DatabaseReference reference;
    private DatabaseReference referenceIsManager;
    private DatabaseReference referenceIsSharedHistory;
    private DatabaseReference referenceHistory;
    private final String KEY_HAND_WASH_HISTORY_TIMES = "HandWashHistory";
    private String user_uid;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.home_screen);

        this.init();
        this.reference.addValueEventListener(this);
        this.referenceIsSharedHistory.addValueEventListener(this);
        this.referenceIsManager.addValueEventListener(this);
        this.btn_exit_shift.setOnClickListener(this);
        this.btnImg_settings.setOnClickListener(this);

        this.showUserData();
    }
    private void init()
    {
        // Shared preferences
        this.sharedPref = getSharedPreferences(String.valueOf(R.string.shared_pref_file_name),MODE_PRIVATE);
        this.editor = this.sharedPref.edit();

        this.profession = this.sharedPref.getString(String.valueOf(R.string.shared_pref_profession),"");
        // attributes
        this.tv_handwash_times = findViewById(R.id.tv_handwash_text);
        this.btn_exit_shift = findViewById(R.id.btn_exit_shift);
        this.btnImg_settings = findViewById(R.id.btnImg_settings);
        this.tv_welcome = findViewById(R.id.tv_welcome);
        this.tv_isManager_state = findViewById(R.id.tv_isManager_text);
        this.tv_isHistoryShared_state = findViewById(R.id.tv_isHistoryShared_text);
        // firebase
        this.database = FirebaseDatabase.getInstance();
        this.user_uid = this.sharedPref.getString(String.valueOf(R.string.shared_pref_user_uid), "");
        this.reference = this.database.getReference("users").child(this.user_uid).child("handWashTimes");
        this.referenceIsManager = this.database.getReference("users").child(this.user_uid).child("isManager");
        this.referenceIsSharedHistory = this.database.getReference("users").child(this.user_uid).child("isSharedHWT");
    }

    private void moveToLoginScreen()
    {
        Intent home_page_intent = new Intent(HomeScreen.this,LoginScreen.class);
        startActivity(home_page_intent);
        overridePendingTransition(R.anim.fade_in,R.anim.fade_out);
        finish();
    }

    private void moveToHistoryScreen()
    {
        Intent history_page_intent = new Intent(HomeScreen.this,HistoryScreen.class);
        startActivity(history_page_intent);
        overridePendingTransition(R.anim.fade_in,R.anim.fade_out);
    }

    public static String getCurrentDateTime()
    {
        // Get current date and time
        Calendar calendar = Calendar.getInstance();
        Date currentDate = calendar.getTime();

        // Format the date and time
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return dateFormat.format(currentDate);
    }

    private void addHandWashToHistory(int handWashPercentageSuccess)
    {
        String userUid = FirebaseAuth.getInstance().getCurrentUser().getUid();

        String handWashDateTime = getCurrentDateTime();

        UserHistoryFireBase historyFireBase = new UserHistoryFireBase(handWashDateTime, handWashPercentageSuccess);
        this.referenceHistory = this.database.getReference("users").child(userUid).child(KEY_HAND_WASH_HISTORY_TIMES).child(historyFireBase.getHandWashDateTime());
        this.referenceHistory.setValue(historyFireBase.getHandWashPercentageSuccess());
    }

    private void showUserData()
    {
        DatabaseReference userReference = database.getReference("users").child(user_uid);

        userReference.addListenerForSingleValueEvent(new ValueEventListener()
        {
            @Override
            public void onDataChange(@NonNull DataSnapshot dataSnapshot)
            {
                if (dataSnapshot.exists())
                {
                    String username = dataSnapshot.child("username").getValue(String.class);
                    String whatJob = dataSnapshot.child("whatJob").getValue(String.class);
                    Boolean isManager = dataSnapshot.child("isManager").getValue(Boolean.class);
                    Boolean isSharedHWT = dataSnapshot.child("isSharedHWT").getValue(Boolean.class);

                    tv_welcome.setText("Welcome!\n" + whatJob + " " + username + " ");
                    if(isManager == false)
                    {
                        tv_isManager_state.setText("Role: Worker");
                    }
                    else
                    {
                        tv_isManager_state.setText("Role: Manager");
                    }
                    if(isSharedHWT == false)
                    {
                        tv_isHistoryShared_state.setText("History is unshared");
                    }
                    else
                    {
                        tv_isHistoryShared_state.setText("History is shared");
                    }
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError databaseError) {}
        });
    }


    @Override
    public void onClick(View v)
    {
        if(v == this.btn_exit_shift)
        {
            Animation buttonLoginAnimation = AnimationUtils.loadAnimation(this, R.anim.fade_in);
            this.btn_exit_shift.startAnimation(buttonLoginAnimation);

            FirebaseAuth.getInstance().signOut();

            new Handler().postDelayed(new Runnable() {
                @Override
                public void run()
                {
                    // Remove user from the list of users that work in Firebase realtime
                    reference.removeValue();
                    database.getReference(profession).child(user_uid).removeValue();
                    moveToLoginScreen();
                }
            }, 1000); // Wait for 1 second before rechecking authentication state
        }
        if(v == this.btnImg_settings)
        {
            this.showSettingsMenu(v);
        }
    }
    @Override
    public void onDataChange(@NonNull DataSnapshot snapshot)
    {
        if (snapshot.getRef().equals(reference))
        {
            // Handle onDataChange for reference
            int hand_wash_times = snapshot.getValue(Integer.class);
            int successPresent = ((int) ((snapshot.getValue(Double.class) - hand_wash_times) * 10)) * 20;

            if (hand_wash_times != 0 &&
                    hand_wash_times != sharedPref.getInt(String.valueOf(R.string.shared_pref_hwt_exit), 0))
            {
                addHandWashToHistory(successPresent);
            }

            tv_handwash_times.setText("Hand Wash Times: " + hand_wash_times);
            editor.putInt(String.valueOf(R.string.shared_pref_hwt_exit), hand_wash_times);
            editor.apply();
        }
        else if (snapshot.getRef().equals(referenceIsSharedHistory))
        {
            if(snapshot.getValue(Boolean.class) == false)
            {
                tv_isHistoryShared_state.setText("History is unshared");
            }
            else
            {
                tv_isHistoryShared_state.setText("History is shared");
            }
        }
        else if (snapshot.getRef().equals(referenceIsManager))
        {
            if(snapshot.getValue(Boolean.class) == false)
            {
                tv_isManager_state.setText("Role: Worker");
            }
            else
            {
                tv_isManager_state.setText("Role: Manager");
            }
        }
    }


    @Override
    public void onCancelled(@NonNull DatabaseError error) {}

    @Override
    public boolean onMenuItemClick(MenuItem item)
    {
        int id = item.getItemId();
        if(id == R.id.menuHistory)
        {
            this.moveToHistoryScreen();
            return true;
        }
        if(id == R.id.menuShareHistory)
        {
            HistoryShareDialog shareHistoryDialog = new HistoryShareDialog(this,
                    LayoutInflater.from(this).inflate(
                            R.layout.history_share_dialog,
                            findViewById(R.id.layoutShareHistoryDialogContainer))
            );
            shareHistoryDialog.showDialog(this.database.getReference("users").child(this.user_uid).child("isSharedHWT"));
            return true;
        }
        return false;
    }

    private void showSettingsMenu(View v)
    {
        PopupMenu popupMenuSettings = new PopupMenu(this, v);
        popupMenuSettings.setOnMenuItemClickListener(this);
        popupMenuSettings.inflate(R.menu.menu_settings);
        showMenuIcons(popupMenuSettings);
        popupMenuSettings.show();
    }

    /**
     * Programmatically forces to display the pop-up menu icons
     * */
    private void showMenuIcons(PopupMenu popup){
        Menu menu = popup.getMenu();
        Method menuMethod;
        try {
            menuMethod = menu.getClass().getDeclaredMethod("setOptionalIconsVisible", Boolean.TYPE);
            menuMethod.setAccessible(true);
            menuMethod.invoke(menu, true);
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }

}