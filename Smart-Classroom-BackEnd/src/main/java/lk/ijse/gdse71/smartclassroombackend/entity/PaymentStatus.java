package lk.ijse.gdse71.smartclassroombackend.entity;

public enum PaymentStatus {
    UNPAID,     // if student hasn’t paid yet
    PENDING,    // if student paid, waiting for approval
    PAID,   // if teacher approved   (ACCEPTED)
    DECLINED,   // if teacher rejected
}
