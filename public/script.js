/* ================================
   Mobile Menu Toggle
=============================== */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('open');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ================================
   Back to Top Button
=============================== */
const backToTopButton = document.getElementById('backToTop');

if (backToTopButton) {
    window.addEventListener('scroll', () => {
        backToTopButton.classList.toggle('visible', window.scrollY > 400);
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ================================
   Fade-in Animations on Scroll
=============================== */
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < window.innerHeight - 100) {
            element.classList.add('is-visible');
        }
    });
};

fadeInOnScroll();
window.addEventListener('scroll', fadeInOnScroll, { passive: true });

// Show hero content immediately on load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hero .fade-in').forEach(el => {
        el.classList.add('is-visible');
    });
});

/* ================================
   Contact Form → FormSubmit (emails inamkhan.me@gmail.com directly)
=============================== */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const contactSubmit = document.getElementById('contactSubmit');

const setFormStatus = (text, type) => {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.classList.remove('success', 'error');
    if (type) formStatus.classList.add(type);
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const subject = contactForm.subject.value.trim();
        const message = contactForm.message.value.trim();

        if (!name || !email || !subject || !message) {
            setFormStatus('Please fill in all fields before sending.', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setFormStatus('Please enter a valid email address.', 'error');
            return;
        }

        const originalBtnHtml = contactSubmit.innerHTML;
        contactSubmit.disabled = true;
        contactSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        setFormStatus('Sending your message...', null);

        try {
            const res = await fetch('https://formsubmit.co/ajax/inamkhan.me@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message,
                    _subject: `Portfolio: ${subject}`,
                    _captcha: 'false',
                    _template: 'table',
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && (data.success === 'true' || data.success === true)) {
                contactForm.reset();
                setFormStatus('✅ Message sent! Inam will reply to you soon.', 'success');
            } else {
                throw new Error(data.message || 'Submission rejected');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setFormStatus('⚠️ Could not send. Please email inamkhan.me@gmail.com directly.', 'error');
        } finally {
            contactSubmit.disabled = false;
            contactSubmit.innerHTML = originalBtnHtml;
        }
    });
}

/* ================================
   Chatbot
=============================== */
const chatBubble = document.getElementById('chat-bubble');
const chatPopup = document.getElementById('chat-popup');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

let chatHistory = [];

const toggleChat = () => {
    chatPopup.classList.toggle('chat-hidden');
    if (!chatPopup.classList.contains('chat-hidden')) {
        chatInput.focus();
    }
};

if (chatBubble && chatPopup && closeChat) {
    chatBubble.addEventListener('click', toggleChat);
    closeChat.addEventListener('click', toggleChat);
}

const escapeHtml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const addMessage = (sender, message) => {
    let messageHtml;

    if (sender === 'user') {
        messageHtml = `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`;
    } else {
        messageHtml = marked.parse(message);
    }

    const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
    const rowClass = sender === 'user' ? 'user-row' : 'bot-row';
    const msgClass = sender === 'user' ? 'user-msg' : 'bot-msg';
    const avatarClass = sender === 'user' ? 'user-avatar' : 'bot-avatar';

    const html = `
        <div class="msg-row ${rowClass}">
            <div class="msg-avatar ${avatarClass}"><i class="fas ${avatarIcon}"></i></div>
            <div class="msg ${msgClass}">${messageHtml}</div>
        </div>
    `;

    chatMessages.insertAdjacentHTML('beforeend', html);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const showTypingIndicator = () => {
    const html = `
        <div id="typing-indicator" class="msg-row bot-row">
            <div class="msg-avatar bot-avatar"><i class="fas fa-robot"></i></div>
            <div class="msg bot-msg">
                <div class="typing-dots">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        </div>
    `;
    chatMessages.insertAdjacentHTML('beforeend', html);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const removeTypingIndicator = () => {
    document.getElementById('typing-indicator')?.remove();
};

const handleChatSubmit = async (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    addMessage('user', userMessage);
    chatInput.value = '';

    chatHistory.push({ role: 'user', content: userMessage });

    showTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage, history: chatHistory.slice(0, -1) }),
        });

        if (!response.ok) throw new Error('Network response was not ok.');

        const data = await response.json();
        removeTypingIndicator();
        addMessage('bot', data.response);
        chatHistory.push({ role: 'assistant', content: data.response });
    } catch (error) {
        console.error('Error with chat API:', error);
        removeTypingIndicator();
        addMessage('bot', 'Sorry, I seem to be having trouble connecting. Please try again later.');
    }
};

if (chatForm) {
    chatForm.addEventListener('submit', handleChatSubmit);
}
