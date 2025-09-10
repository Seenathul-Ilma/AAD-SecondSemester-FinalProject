package lk.ijse.gdse71.smartclassroombackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/15/2025 3:15 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data           // Includes @Getter, @Setter, @ToString
@Builder
@Entity
public class User {
    @Id
    @Column(name = "user_id")   // maps to DB column
    private String userId;

    @Column
    private String name;

    @Column
    private String nic;

    @Column
    private String address;

    @Column
    private String contact;

    @Column(unique = true)
    private String email;

    @Column
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "profile_img", nullable = true)
    private String profileImg;

    @Column(name = "emergency_contact", nullable = true)
    private String emergencyContact;

    @Column(nullable = true)
    private String relationship;   // relationship between given emergency contact

    // Relationships

    // Bidirectional
    // Conversations where this user is the sender
    @JsonIgnore
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> sentConversations;     // ok

    // Conversations where this user is the receiver
    @JsonIgnore
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> receivedConversations;    // ok

    // Messages sent by this user
    @JsonIgnore
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> sentMessages;       // ok

    // Messages received by this user
    @JsonIgnore
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> receivedMessages;    // ok

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Assignment> assignments;   // ok

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Announcement> announcements;  // ok

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Resources> resources;  // ok

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserClassroom> userClassrooms;   // ok

    //@OneToMany(mappedBy = "user")
    //private List<Submission> submissions;       // ok

    //@OneToMany(mappedBy = "user")
    //private List<Payment> payments;             // ok

}
