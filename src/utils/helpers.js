export const formatChatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    today.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);
    
    const diffTime = today - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Сегодня';
    } else if (diffDays === 1) {
        return 'Вчера';
    } else {
        return messageDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
};

export const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

export const getStatusByPoints = (points) => {
    if (points === 0) return null;
    if (points >= 5501) return 'Пламенное Сердце';
    if (points >= 2501) return 'Благотворитель';
    if (points >= 501) return 'Хранитель Надежды';
    if (points >= 5) return 'Друг Платформы';
    return null;
};

export const formatPhone = (value) => {
    let phone = value.replace(/\D/g, '');
    if (phone.length > 0) {
        if (phone[0] !== '7') {
            phone = '7' + phone;
        }
        let formatted = '+7';
        if (phone.length > 1) {
            formatted += ' (' + phone.substring(1, 4);
        }
        if (phone.length >= 5) {
            formatted += ') ' + phone.substring(4, 7);
        }
        if (phone.length >= 8) {
            formatted += '-' + phone.substring(7, 9);
        }
        if (phone.length >= 10) {
            formatted += '-' + phone.substring(9, 11);
        }
        return formatted;
    }
    return value;
};


