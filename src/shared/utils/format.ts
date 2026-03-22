export const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

export const formatDateTime = (value?: string): string => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export const formatIpAddress = (value?: string): string => {
  if (!value) return 'N/A';

  const ip = value.trim();
  if (!ip) return 'N/A';

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;

  if (ip === '::1') {
    return '127.0.0.1 (IPv4)';
  }

  if (ip.startsWith('::ffff:')) {
    const mapped = ip.slice(7);
    if (ipv4Regex.test(mapped)) {
      return `${mapped} (IPv4)`;
    }
  }

  if (ipv4Regex.test(ip)) {
    return `${ip} (IPv4)`;
  }

  if (ipv6Regex.test(ip) && ip.includes(':')) {
    return `${ip} (IPv6)`;
  }

  return ip;
};
