css_to_add = """
/* ================================================
   Themed CTA Strip (Dark Blue & Gold)
================================================ */
.themed-cta-strip {
    background-color: var(--primary-color);
    padding: 80px 20px;
}
.themed-cta-heading {
    color: var(--secondary-color);
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 20px;
}
.themed-cta-divider {
    height: 3px;
    width: 60px;
    background: linear-gradient(90deg, var(--secondary-color), #f0c842);
    margin: 0 auto 25px;
    border-radius: 2px;
}
.themed-cta-desc {
    color: #e0e0e0;
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 650px;
    margin: 0 auto 40px;
}
.themed-cta-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
}
.btn-themed-gold {
    background: linear-gradient(135deg, var(--secondary-color), #f0c842);
    color: var(--primary-color) !important;
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-family: var(--font-body);
    font-size: 1rem;
    text-decoration: none;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}
.btn-themed-gold:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
}
.btn-themed-dark {
    background: transparent;
    color: #25D366 !important;
    border: 2px solid #25D366;
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 600;
    font-family: var(--font-body);
    font-size: 1rem;
    text-decoration: none;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.btn-themed-dark:hover {
    background: rgba(37, 211, 102, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(37, 211, 102, 0.2);
}

@media screen and (max-width: 768px) {
    .themed-cta-buttons {
        flex-direction: column;
        gap: 16px;
        padding: 0 20px;
    }
    .btn-themed-gold, .btn-themed-dark {
        width: 100%;
        justify-content: center;
    }
    .themed-cta-heading {
        font-size: 1.8rem;
    }
}
"""

with open('styles.css', 'a', encoding='utf-8') as f:
    f.write(css_to_add)

print("CSS added successfully.")
