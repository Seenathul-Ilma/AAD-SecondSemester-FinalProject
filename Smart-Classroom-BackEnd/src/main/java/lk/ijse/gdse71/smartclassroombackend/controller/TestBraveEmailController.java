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

        String htmlContent = "<html>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6;'>" +
                "<h2>Welcome to Smart Classroom..!</h2>" +
                "<p>Hello,</p>" +
                "<p>Your account has been created successfully. Here’s your login info:</p>" +
                "<table style='border-collapse: collapse; width: 100%; max-width: 400px;'>" +
                "  <tr style='background-color: #f2f2f2;'>" +
                "    <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>User ID</th>" +
                "    <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Username</th>" +
                "    <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Password</th>" +
                "  </tr>" +
                "</table>" +
                "<p>Please <strong>change your password</strong> after logging in.</p>" +
                "<p>Thanks,<br/>Smart Classroom Team</p>" +
                "</body>" +
                "</html>";

        emailService.sendEmail(
                "zeenathulilma121243@gmail.com",
                "Start Your Journey with Smart Classroom Today",
                htmlContent
        );

        //emailService.sendEmail("zeenathulilma121243@gmail.com", "Test Email Set", "Hello from Brevo via Gmail! (❁´◡`❁)😁😍");
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
