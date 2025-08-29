package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.service.BrevoEmailService;
import lk.ijse.gdse71.smartclassroombackend.service.EmailService;
import lk.ijse.gdse71.smartclassroombackend.service.impl.BrevoEmailServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/29/2025 8:08 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@RestController
@RequestMapping("/api/v1/email")  // <-- use RequestMapping here
public class TestBraveEmailController {

    @Autowired
    private BrevoEmailService emailService;

    @GetMapping("/send-test-email")
    public String sendTestEmail() {
        emailService.sendEmail("zeenathulilma121243@gmail.com", "Test Email Set", "Hello from Brevo via Gmail! (❁´◡`❁)😁😍");
        return "Email Sent!";
    }

    @PostMapping("/send")
    public String sendBulkEmail() {
        emailService.sendBulkEmail(
                Arrays.asList(
                        "zeenathulilma121243@gmail.com",
                        "seenathulilma121243@gmail.com",
                        "aiautomationzilma07@gmail.com"
                ),
                "Test Bulk Email",
                "Hello! This is a test bulk email from Spring Boot using Brevo."
        );
        return "Bulk email process started! Check logs for results.";
    }
}
