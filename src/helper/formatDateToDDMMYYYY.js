export const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return null; // Retorna null o cadena vacía si no hay fecha
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};