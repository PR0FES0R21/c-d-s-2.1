// ===========================================================================
// File: src/utils/timeFormatters.ts (BARU)
// Deskripsi: Kumpulan fungsi untuk memformat waktu, termasuk format waktu alien.
// ===========================================================================
import { differenceInDays, startOfDay, differenceInMinutes, differenceInSeconds } from 'date-fns';

// Definisikan Alien Epoch sebagai konstanta
// 5 Juni 2005, 00:00:00 UTC
const ALIEN_EPOCH = new Date(Date.UTC(2005, 5, 5, 0, 0, 0)); // Bulan di JS adalah 0-indexed (0=Jan, 5=Juni)

const SECONDS_IN_A_DAY = 24 * 60 * 60;
const SHARDS_IN_A_DAY = 1000;
const SECONDS_PER_SHARD = SECONDS_IN_A_DAY / SHARDS_IN_A_DAY; // 86.4

/**
 * Mengkonversi tanggal ISO string atau objek Date menjadi format waktu alien.
 * Format: Δ<cycle>·Ξ<tick>‣Ø<shard>
 * @param dateInput Tanggal dalam format ISO string atau objek Date.
 * @returns String waktu alien atau "Invalid Date" jika input tidak valid.
 */
export const formatToAlienTime = (dateInput: string | Date): string => {
  try {
    const earthDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Pastikan earthDate adalah objek Date yang valid
    if (isNaN(earthDate.getTime())) {
      throw new Error("Invalid date input");
    }

    // 1. Hitung Cycle (Δ)
    // Jumlah hari penuh sejak Alien Epoch. Gunakan startOfDay untuk perbandingan yang adil.
    const earthDateStartOfDay = startOfDay(earthDate);
    const alienEpochStartOfDay = startOfDay(ALIEN_EPOCH);
    const cycle = differenceInDays(earthDateStartOfDay, alienEpochStartOfDay);

    // 2. Hitung Tick (Ξ)
    // Jumlah menit sejak tengah malam (00:00) pada hari bergabungnya (waktu lokal earthDate).
    const startOfEarthDateDay = startOfDay(earthDate); // Tengah malam pada hari bergabung
    const tick = differenceInMinutes(earthDate, startOfEarthDateDay);

    // 3. Hitung Shard (Ø)
    // Detik keberapa pada hari itu, dibagi menjadi 1000 fragmen.
    const secondsSinceMidnight = differenceInSeconds(earthDate, startOfEarthDateDay);
    const shard = Math.floor(secondsSinceMidnight / SECONDS_PER_SHARD);

    return `Δ${cycle}·Ξ${tick}‣Ø${shard}`;

  } catch (error) {
    console.error("Error formatting to alien time:", error);
    return "Invalid Alien Date";
  }
};

/**
 * Mengecek apakah seorang ally baru berdasarkan tanggal bergabungnya.
 * @param joinedAt Tanggal bergabung dalam format ISO string atau objek Date.
 * @param daysThreshold Jumlah hari untuk dianggap baru (default 3).
 * @returns boolean
 */
export const isNewRecruit = (joinedAt: string | Date, daysThreshold: number = 3): boolean => {
  try {
    const joinDate = typeof joinedAt === 'string' ? new Date(joinedAt) : joinedAt;
    if (isNaN(joinDate.getTime())) return false;
    
    const today = new Date();
    return differenceInDays(today, joinDate) < daysThreshold;
  } catch (e) {
    return false;
  }
};