/**
 * Gerador de Payload Pix EMV / BR Code padrão Banco Central (Estático com valor).
 * Implementação matemática com CRC-16 CCITT (0xFFFF, poly 0x1021).
 */

function formatarTLV(id: string, valor: string): string {
  const encoder = new TextEncoder();
  const len = encoder.encode(valor).length;
  const lenStr = len < 10 ? `0${len}` : `${len}`;
  return `${id}${lenStr}${valor}`;
}

function normalizar(texto: string, maxLen: number): string {
  const semAcentos = (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
  const val = semAcentos.length === 0 ? 'RACHAAI' : semAcentos;
  return val.length > maxLen ? val.substring(0, maxLen) : val;
}

export function calcularCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(payload);

  for (const b of bytes) {
    crc ^= (b & 0xff) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }

  const hex = crc.toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

export function gerarPayloadPix(
  chavePix: string,
  nomeHost: string,
  cidade: string = 'SAO PAULO',
  valor: number = 0,
  txId: string = '***'
): string {
  if (!chavePix || chavePix.trim() === '') {
    return '';
  }

  const nomeSanitizado = normalizar(nomeHost || 'RACHAAI', 25);
  const cidadeSanitizada = normalizar(cidade || 'SAO PAULO', 15).toUpperCase();
  let txIdSanitizado = (txId || '***').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (txIdSanitizado.length === 0) txIdSanitizado = '***';
  if (txIdSanitizado.length > 25) txIdSanitizado = txIdSanitizado.substring(0, 25);

  let payload = '';

  // 00 - Payload Format Indicator (01)
  payload += formatarTLV('00', '01');

  // 01 - Point of Initiation Method (12 = Dinâmico / 11 = Estático reutilizável)
  payload += formatarTLV('01', '12');

  // 26 - Merchant Account Information (GUI + Chave)
  const gui = formatarTLV('00', 'br.gov.bcb.pix');
  const chave = formatarTLV('01', chavePix.trim());
  payload += formatarTLV('26', gui + chave);

  // 52 - Merchant Category Code
  payload += formatarTLV('52', '0000');

  // 53 - Transaction Currency (986 = BRL)
  payload += formatarTLV('53', '986');

  // 54 - Transaction Amount
  if (valor > 0) {
    payload += formatarTLV('54', valor.toFixed(2));
  }

  // 58 - Country Code
  payload += formatarTLV('58', 'BR');

  // 59 - Merchant Name
  payload += formatarTLV('59', nomeSanitizado);

  // 60 - Merchant City
  payload += formatarTLV('60', cidadeSanitizada);

  // 62 - Additional Data Field Template (TxID)
  const refLabel = formatarTLV('05', txIdSanitizado);
  payload += formatarTLV('62', refLabel);

  // 63 - CRC16 prefix
  payload += '6304';

  const crc = calcularCRC16(payload);
  return payload + crc;
}
