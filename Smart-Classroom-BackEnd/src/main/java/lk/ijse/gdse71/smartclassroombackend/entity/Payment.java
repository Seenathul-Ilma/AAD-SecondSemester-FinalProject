package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/22/2025 1:16 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Payment {
    @Id
    @Column(name = "payment_id")
    private String paymentId;

    private Double amount;
    private LocalDateTime paidAt;
    private String method;           // CASH, CARD, ONLINE

    private String student;   // userId
    private String userClassroom;  // classroomId

}
