export const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const ordinal = (n) => { const s = ['th','st','nd','rd']; const v = n % 100; return n + (s[(v-20)%10] || s[v] || s[0]); };
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${ordinal(day)}, ${year}`;
};

export const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const h = hour % 12 || 12;
    return `${h}:${String(minute).padStart(2, '0')}${ampm}`;
};