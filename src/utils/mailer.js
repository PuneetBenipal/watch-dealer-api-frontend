import emailjs from "@emailjs/browser";

const templates = {
    "reset": "template_0s2cyd5",
    "contact": "template_xe3mol9"
}


export const mailer = ({ email = '', message = '', html = '', subject = '', reset_link = '' }) => {
    let templateId = '';
    if (!reset_link) templateId = templates["contact"];
    else templateId = templates["reset"];

    if (!email) return "Email is Required.";

    emailjs.send("service_p6jpasq", templateId, {
        name: "Hi, Nice to meet you.",
        subject: subject,
        message: message,
        to: email,
        html: html,
        link: reset_link,
    }, 'qKkoQa6xr1VmUkeLa');
}

