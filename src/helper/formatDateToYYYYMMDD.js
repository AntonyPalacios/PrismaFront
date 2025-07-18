export const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
}