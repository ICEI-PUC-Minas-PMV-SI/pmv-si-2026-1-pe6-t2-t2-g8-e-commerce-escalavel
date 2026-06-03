// src/utils/userUtils.js

// Sanitiza o objeto do usuário removendo campos sensíveis
const sanitizeUser = (user) => {
  if (!user) return null;

  const address =
    user.address_street ||
    user.address_city ||
    user.address_state ||
    user.address_zip
      ? {
          street: user.address_street,
          city: user.address_city,
          state: user.address_state,
          zip: user.address_zip,
        }
      : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf || null,
    phone: user.phone || null,
    role: user.role,
    created_at: user.created_at,
    active: user.active,
    address,
  };
};

// Valida formato de e-mail
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Valida CPF (aceita 000.000.000-00 ou 00000000000)
const isValidCPF = (cpf) => {
  const cleaned = cpf.replace(/[.\-]/g, '');
  return /^\d{11}$/.test(cleaned);
};

// Valida telefone brasileiro (aceita (00) 00000-0000 ou apenas dígitos 10-11)
const isValidPhone = (phone) => {
  const cleaned = phone.replace(/[\s()\-]/g, '');
  return /^\d{10,11}$/.test(cleaned);
};

// Valida campos do endereço (opcional)
const validateAddress = (address) => {
  if (!address) return true;

  const { street, city, state, zip } = address;

  if (
    (street && typeof street !== 'string') ||
    (city && typeof city !== 'string') ||
    (state && typeof state !== 'string') ||
    (zip && typeof zip !== 'string')
  ) {
    return false;
  }

  return true;
};

module.exports = {
  sanitizeUser,
  isValidEmail,
  isValidCPF,
  isValidPhone,
  validateAddress,
};
