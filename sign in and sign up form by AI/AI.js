// Form Animation and Validation System
class FormManager {
    constructor() {
        this.currentForm = 'login';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.setupInputAnimations();
    }

    bindEvents() {
        // Form toggle buttons
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const formType = e.target.dataset.form;
                this.switchForm(formType);
            });
        });

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        signupForm.addEventListener('submit', (e) => this.handleSignup(e));

        // Social buttons
        const socialBtns = document.querySelectorAll('.social-btn');
        socialBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Forgot password
        const forgotPassword = document.querySelector('.forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessage('Password reset link would be sent to your email!', 'info');
            });
        }
    }

    switchForm(formType) {
        if (this.currentForm === formType || this.isLoading) return;

        const toggleBtns = document.querySelectorAll('.toggle-btn');
        const toggleIndicator = document.querySelector('.toggle-indicator');
        const forms = document.querySelectorAll('.form');

        // Update toggle buttons
        toggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.form === formType);
        });

        // Move indicator
        toggleIndicator.classList.toggle('signup', formType === 'signup');

        // Switch forms with animation
        forms.forEach(form => {
            form.classList.remove('active');
        });

        // Add slight delay for smooth transition
        setTimeout(() => {
            const targetForm = document.querySelector(`.${formType}-form`);
            targetForm.classList.add('active');
            this.currentForm = formType;
            
            // Clear any existing validation messages
            this.clearValidationMessages();
        }, 150);
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Clear validation on focus
            input.addEventListener('focus', () => {
                this.clearFieldValidation(input);
            });

            // Special handling for password confirmation
            if (input.id === 'confirmPassword') {
                input.addEventListener('input', () => {
                    this.validatePasswordMatch();
                });
            }

            // Email validation on input
            if (input.type === 'email') {
                input.addEventListener('input', () => {
                    if (input.value.length > 0) {
                        this.validateEmail(input);
                    }
                });
            }
        });
    }

    validateField(input) {
        const inputGroup = input.closest('.input-group');
        const validationMessage = inputGroup.querySelector('.validation-message');
        
        let isValid = true;
        let message = '';

        // Required field validation
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            message = `${this.getFieldName(input)} is required`;
        }
        // Email validation
        else if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        // Password validation
        else if (input.type === 'password' && input.value && input.id.includes('Password')) {
            if (input.value.length < 6) {
                isValid = false;
                message = 'Password must be at least 6 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(input.value)) {
                isValid = false;
                message = 'Password must contain uppercase, lowercase, and number';
            }
        }
        // Name validation
        else if (input.id === 'signupName' && input.value) {
            if (input.value.trim().length < 2) {
                isValid = false;
                message = 'Name must be at least 2 characters';
            }
        }

        this.showFieldValidation(input, isValid, message);
        return isValid;
    }

    validatePasswordMatch() {
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            this.showFieldValidation(confirmPassword, false, 'Passwords do not match');
            return false;
        } else if (confirmPassword.value) {
            this.showFieldValidation(confirmPassword, true, '');
            return true;
        }
        return true;
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value);
        
        if (!isValid && input.value.length > 0) {
            this.showFieldValidation(input, false, 'Please enter a valid email address');
        } else if (isValid) {
            this.showFieldValidation(input, true, '');
        }
        
        return isValid;
    }

    showFieldValidation(input, isValid, message) {
        const inputGroup = input.closest('.input-group');
        const validationMessage = inputGroup.querySelector('.validation-message');
        
        validationMessage.textContent = message;
        validationMessage.classList.toggle('show', message !== '');
        validationMessage.classList.toggle('success', isValid && message === '');
        
        // Update input styling
        input.style.borderColor = message && !isValid ? 'var(--error-color)' : '';
    }

    clearFieldValidation(input) {
        const inputGroup = input.closest('.input-group');
        const validationMessage = inputGroup.querySelector('.validation-message');
        
        validationMessage.classList.remove('show');
        input.style.borderColor = '';
    }

    clearValidationMessages() {
        const validationMessages = document.querySelectorAll('.validation-message');
        validationMessages.forEach(msg => {
            msg.classList.remove('show');
        });
        
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    }

    getFieldName(input) {
        const label = input.closest('.input-group').querySelector('label');
        return label ? label.textContent : 'Field';
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;
        const rememberMe = form.querySelector('#rememberMe').checked;

        // Validate form
        const emailValid = this.validateField(form.querySelector('#loginEmail'));
        const passwordValid = this.validateField(form.querySelector('#loginPassword'));

        if (!emailValid || !passwordValid) {
            this.showMessage('Please fix the errors above', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(form, true);

        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Success
            this.showMessage('Login successful! Welcome back!', 'success');
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('userEmail', email);
            }
            
            // Simulate redirect after success
            setTimeout(() => {
                this.showMessage('Redirecting to dashboard...', 'info');
            }, 1500);

        } catch (error) {
            this.showMessage('Invalid email or password. Please try again.', 'error');
        } finally {
            this.setLoadingState(form, false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const name = form.querySelector('#signupName').value;
        const email = form.querySelector('#signupEmail').value;
        const password = form.querySelector('#signupPassword').value;
        const agreeTerms = form.querySelector('#agreeTerms').checked;

        // Validate all fields
        const nameValid = this.validateField(form.querySelector('#signupName'));
        const emailValid = this.validateField(form.querySelector('#signupEmail'));
        const passwordValid = this.validateField(form.querySelector('#signupPassword'));
        const passwordMatchValid = this.validatePasswordMatch();

        if (!agreeTerms) {
            this.showMessage('Please agree to the Terms & Conditions', 'error');
            return;
        }

        if (!nameValid || !emailValid || !passwordValid || !passwordMatchValid) {
            this.showMessage('Please fix the errors above', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(form, true);

        try {
            // Simulate API call
            await this.simulateApiCall(2000); // Longer delay for signup
            
            // Success
            this.showMessage('Account created successfully! Please check your email for verification.', 'success');
            
            // Auto switch to login after successful signup
            setTimeout(() => {
                this.switchForm('login');
                // Pre-fill email in login form
                document.getElementById('loginEmail').value = email;
                this.showMessage('You can now sign in with your new account', 'info');
            }, 2000);

        } catch (error) {
            this.showMessage('Email already exists or server error. Please try again.', 'error');
        } finally {
            this.setLoadingState(form, false);
        }
    }

    async handleSocialLogin(e) {
        const provider = e.currentTarget.classList.contains('google') ? 'Google' : 'GitHub';
        
        this.showMessage(`Redirecting to ${provider}...`, 'info');
        
        // Simulate social login
        setTimeout(() => {
            this.showMessage(`${provider} authentication would open in a new window`, 'info');
        }, 1000);
    }

    setLoadingState(form, loading) {
        this.isLoading = loading;
        const submitBtn = form.querySelector('.submit-btn');
        
        submitBtn.classList.toggle('loading', loading);
        submitBtn.disabled = loading;
        
        // Disable all form inputs during loading
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(input => {
            if (input !== submitBtn) {
                input.disabled = loading;
            }
        });
    }

    setupPasswordToggle() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.dataset.target;
                const passwordInput = document.getElementById(targetId);
                const eyeIcon = toggle.querySelector('.eye-icon');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eyeIcon.style.opacity = '1';
                } else {
                    passwordInput.type = 'password';
                    eyeIcon.style.opacity = '0.7';
                }
            });
        });
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('.input-group input');
        
        inputs.forEach(input => {
            // Add focus animation
            input.addEventListener('focus', () => {
                const inputGroup = input.closest('.input-group');
                inputGroup.style.transform = 'scale(1.02)';
                inputGroup.style.transition = 'transform 0.2s ease';
            });

            input.addEventListener('blur', () => {
                const inputGroup = input.closest('.input-group');
                inputGroup.style.transform = 'scale(1)';
            });

            // Add typing animation
            input.addEventListener('input', () => {
                const highlight = input.parentElement.querySelector('.input-highlight');
                highlight.style.width = '100%';
                
                setTimeout(() => {
                    if (!input.matches(':focus')) {
                        highlight.style.width = '0';
                    }
                }, 200);
            });
        });
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.toast-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageEl = document.createElement('div');
        messageEl.className = `toast-message ${type}`;
        messageEl.textContent = message;
        
        // Add styles
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            warning: '#ed8936',
            info: '#4299e1'
        };
        messageEl.style.background = colors[type] || colors.info;

        document.body.appendChild(messageEl);

        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentElement) {
                    messageEl.remove();
                }
            }, 300);
        }, 4000);
    }

    simulateApiCall(delay = 1500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                const success = Math.random() > 0.2; // 80% success rate
                if (success) {
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, delay);
        });
    }
}

// Enhanced animations and interactions
class AnimationEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupParallaxEffect();
        this.setupMouseFollower();
        this.setupKeyboardNavigation();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        // Observe form elements for entrance animations
        const elements = document.querySelectorAll('.input-group, .submit-btn, .social-btn');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    setupParallaxEffect() {
        const shapes = document.querySelectorAll('.background .shape');
        
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                const x = (mouseX - 0.5) * speed * 20;
                const y = (mouseY - 0.5) * speed * 20;
                
                shape.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }

    setupMouseFollower() {
        const formContainer = document.querySelector('.form-container');
        
        formContainer.addEventListener('mousemove', (e) => {
            const rect = formContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * 5;
            const rotateY = (centerX - x) / centerX * 5;
            
            formContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        formContainer.addEventListener('mouseleave', () => {
            formContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusedElement = document.activeElement;
                if (focusedElement.matches('input, button')) {
                    focusedElement.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.4)';
                }
            }
        });

        document.addEventListener('focusout', (e) => {
            e.target.style.boxShadow = '';
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormManager();
    new AnimationEnhancer();
    
    // Add some initial flair
    setTimeout(() => {
        const container = document.querySelector('.form-container');
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
    
    // Pre-fill email if remembered
    const rememberedEmail = localStorage.getItem('userEmail');
    if (rememberedEmail && localStorage.getItem('rememberMe') === 'true') {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// Add some CSS for initial state
const initialStyles = `
    .form-container {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = initialStyles;
document.head.appendChild(styleSheet);