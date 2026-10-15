# Vestra 🛍️
### Full-Stack Fashion E-Commerce Web Application

Vestra is a full-stack fashion e-commerce web application built using **React, FastAPI, Python, SQLAlchemy, and Razorpay**. It brings together a modern frontend, RESTful backend services, database operations, and payment gateway integration to create an online shopping experience.

This project demonstrates practical experience in full-stack application development, API integration, and payment processing.

---

## 🚀 Features

- **Fashion Product Catalog** — Browse fashion products through an interactive interface.
- **Shopping Cart** — Add and manage products in a shopping cart.
- **Online Payments** — Razorpay integration for payment processing during checkout.
- **RESTful APIs** — Backend services developed with FastAPI.
- **Database Integration** — SQLAlchemy ORM for interacting with the application database.
- **Responsive Frontend** — React-based user interface for an accessible shopping experience.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, JavaScript |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| API | REST APIs |
| Payments | Razorpay |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

```text
             ┌───────────────────┐
             │   React Frontend  │
             │   (User Interface)│
             └─────────┬─────────┘
                       │
                  REST API
                       │
             ┌─────────▼─────────┐
             │  FastAPI Backend  │
             │   (Python)        │
             └─────────┬─────────┘
                       │
              ┌────────┴────────┐
              │                 │
       ┌──────▼───────┐  ┌──────▼───────┐
       │ SQLAlchemy   │  │   Razorpay   │
       │ ORM          │  │ Payment API  │
       └──────┬───────┘  └──────────────┘
              │
       ┌──────▼───────┐
       │   Database   │
       └──────────────┘
```

## 📂 Project Structure

```text
vestra/
├── backend/          # FastAPI backend application
├── frontend/         # React frontend application
├── .gitignore
├── package.json
├── render.yaml
├── server.js
└── README.md
```

##💳 Payment Integration

Vestra integrates **Razorpay** to support online payments.

The integration connects the application's checkout experience with Razorpay's payment services.

Sensitive payment credentials should be stored in environment variables and never committed to the repository.



##🔮 Future Enhancements

- Advanced product search and filtering
- Improved order tracking
- Automated testing
- Performance optimization
- Additional payment and checkout improvements

##👨‍💻 Developer

**Aditya Prasad**

B.Tech in Computer Science & Engineering (AI)

GitHub: https://github.com/Aditya-web-cloud

---

⭐ If you find this project useful, consider starring the repository.

