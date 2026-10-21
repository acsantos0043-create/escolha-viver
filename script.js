/**
 * Espaço Vitalle Poá - Script Principal
 * Funcionalidades: Menu Mobile, Scroll Reveal, Accordion, Formulário com Draft, Cookies, Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initAccordion();

    initCookieBanner();
    initFormDraftAndValidation();
    initWhatsAppContextual();
});

// 1. Header Glassmorphism no Scroll
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
}

// 2. Menu Mobile
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggle || !navMenu) return;

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// 3. Scroll Reveal (Intersection Observer)
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    // Respeitar prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        reveals.forEach(el => el.classList.add('active'));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target); // Animar apenas uma vez
            }
        });
    }, observerOptions);

    reveals.forEach(el => observer.observe(el));
}

// 4. FAQ Accordion
function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const content = header.nextElementSibling;
            
            // Fechar todos os outros (opcional, comportamento de accordion estrito)
            headers.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle atual
            header.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });
}

// 5. Cookie Banner e Consentimento (LocalStorage Seguro)
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    if (!banner) return;

    const consent = localStorage.getItem('vitalle_cookie_consent');
    
    if (!consent) {
        banner.style.display = 'flex';
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('vitalle_cookie_consent', 'accepted');
        banner.style.display = 'none';
        trackEvent('cookie_consent_accepted');
        // Aqui você inicializaria GTM/GA4 de fato
    });

    declineBtn.addEventListener('click', () => {
        localStorage.setItem('vitalle_cookie_consent', 'declined');
        banner.style.display = 'none';
        trackEvent('cookie_consent_declined');
    });
}

// 6. Função de Tracking (Verifica Consentimento)
window.trackEvent = function(eventName, eventData = {}) {
    const consent = localStorage.getItem('vitalle_cookie_consent');
    
    // Só envia eventos de marketing se o usuário aceitou
    if (consent === 'accepted') {
        console.log(`[TRACKING] Evento: ${eventName}`, eventData);
        
        // Exemplo de integração com dataLayer do GTM:
        if (window.dataLayer) {
            window.dataLayer.push({
                event: eventName,
                ...eventData
            });
        }
        
        // Exemplo para Meta Pixel:
        // if (typeof fbq === 'function') { fbq('trackCustom', eventName, eventData); }
    } else {
        console.log(`[TRACKING BLOQUEADO] ${eventName} (Consentimento: ${consent})`);
    }
};

// 7. Formulário: Validação, Draft no LocalStorage e Envio Simulado
function initFormDraftAndValidation() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    const formId = 'vitalle_form_draft';

    // Carregar rascunho
    const savedDraft = localStorage.getItem(formId);
    if (savedDraft) {
        const data = JSON.parse(savedDraft);
        inputs.forEach(input => {
            if (data[input.name]) {
                input.value = data[input.name];
                // Disparar evento para atualizar floating labels
                input.dispatchEvent(new Event('input'));
            }
        });
    }

    // Salvar rascunho a cada alteração
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const formData = {};
            inputs.forEach(inp => {
                formData[inp.name] = inp.value;
            });
            localStorage.setItem(formId, JSON.stringify(formData));
        });
    });

    // Validação e Envio
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        inputs.forEach(input => {
            const group = input.closest('.form-group');
            if (input.hasAttribute('required') && !input.value.trim()) {
                group.classList.add('error');
                isValid = false;
            } else if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    group.classList.add('error');
                    isValid = false;
                } else {
                    group.classList.remove('error');
                }
            } else if (input.type === 'tel' && input.value) {
                const telRegex = /^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;
                if (!telRegex.test(input.value.replace(/\s/g, ''))) {
                    group.classList.add('error');
                    isValid = false;
                } else {
                    group.classList.remove('error');
                }
            } else {
                group.classList.remove('error');
            }
        });

        if (isValid) {
            const btn = form.querySelector('button[type="submit"]');
            const btnText = btn.querySelector('.btn-text');
            const btnLoader = btn.querySelector('.btn-loader');
            
            // Estado de loading
            btn.disabled = true;
            btnText.textContent = 'Enviando...';
            btnLoader.hidden = false;
            btnLoader.textContent = '⏳';

            // Simulação de envio (substituir por fetch real para backend/Formspree)
            setTimeout(() => {
                trackEvent('form_submitted', { servico: form.servico.value });
                localStorage.removeItem(formId); // Limpar rascunho
                
                // Redirecionar para WhatsApp com os dados preenchidos como fallback elegante
                const nome = form.nome.value;
                const servico = form.servico.options[form.servico.selectedIndex].text;
                const msg = `Olá! Meu nome é ${nome}. Preenchi o formulário no site e tenho interesse em: ${servico}.`;
                const whatsappUrl = `https://wa.me/5511916348397?text=${encodeURIComponent(msg)}`;
                
                window.open(whatsappUrl, '_blank');
                
                // Resetar formulário
                form.reset();
                btn.disabled = false;
                btnText.textContent = 'Enviar Solicitação';
                btnLoader.hidden = true;
                
                alert('Obrigado! Redirecionando para o WhatsApp para finalizar seu agendamento.');
            }, 1500);
        } else {
            trackEvent('form_validation_error');
        }
    });

    // Remover erro ao digitar
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.closest('.form-group').classList.remove('error');
        });
    });
}

// 8. WhatsApp Contextual (Muda a mensagem baseado na seção visível ou tempo)
function initWhatsAppContextual() {
    const waFloat = document.getElementById('whatsapp-float');
    if (!waFloat) return;

    // Atualizar tooltip após 5 segundos se o usuário não interagir
    setTimeout(() => {
        const tooltip = waFloat.querySelector('.whatsapp-tooltip');
        if (tooltip) {
            tooltip.textContent = '💬 Dúvidas? Fale com a gente!';
        }
    }, 5000);
}