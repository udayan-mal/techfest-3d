import * as THREE from 'three';

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * Camera keyframes per station.
 * p0/l0 = camera position/look target when the station starts,
 * p1/l1 = where it drifts to while the station is pinned.
 * Between stations the camera flies from p1/l1 of one to p0/l0 of the next.
 */
export const stations = [
  { name: 'Core',     p0: v(0, 0, 9),       p1: v(0, 0.3, 7.5),    l0: v(0, 0, 0),        l1: v(0, 0, 0),        bg: '#05030f' },
  { name: 'Legacy',   p0: v(0, 0, -8),      p1: v(0, 0, -48),      l0: v(0, 0, -20),      l1: v(0, 0, -60),      bg: '#060322' },
  { name: 'Segments', p0: v(0, 2, -63),     p1: v(0, 3, -65),      l0: v(0, 0, -80),      l1: v(0, -0.5, -80),   bg: '#0a0420' },
  { name: 'Robowars', p0: v(10, 3.5, -110), p1: v(-3, 3.5, -110),  l0: v(1, -0.6, -120),  l1: v(1.5, -0.6, -120), bg: '#140408' },
  { name: 'Global',   p0: v(0, 0.4, -152),  p1: v(-1, 0.6, -154),  l0: v(0, 0, -165),     l1: v(0, 0, -165),     bg: '#020b18' },
  { name: 'Portal',   p0: v(0, 0, -197),    p1: v(0, 0, -205),     l0: v(0, 0, -220),     l1: v(0, 0, -220),     bg: '#0c0219' },
];

export const sectionNames = ['Core', 'Legacy', 'Segments', 'Robowars', 'Global', 'Enter'];

export const segments = [
  {
    name: 'Competitions', color: '#ffc857', shape: 'octa',
    tagline: 'Build. Battle. Win.',
    desc: 'International challenges in robotics, coding, aeromodelling and design. Teams from across the globe compete for big prize pools and serious bragging rights.',
    chips: ['Robotics', 'Coding', 'Aero', 'Design'],
  },
  {
    name: 'Lectures', color: '#5ef2ff', shape: 'planet',
    tagline: 'Hear the minds that move the world.',
    desc: 'Talks by Nobel laureates, astronauts, founders and policy makers. A stage that has hosted Dr. A.P.J. Abdul Kalam and many of the greatest thinkers of our time.',
    chips: ['Keynotes', 'Panels', 'Q&A'],
  },
  {
    name: 'Workshops', color: '#a78bfa', shape: 'knot',
    tagline: 'Learn it by building it.',
    desc: 'Hands on sessions in AI, drones, ethical hacking, IoT and robotics led by industry experts. Walk in curious, walk out with something you built yourself.',
    chips: ['AI / ML', 'Drones', 'Cyber', 'IoT'],
  },
  {
    name: 'Exhibitions', color: '#3dffb5', shape: 'dodeca',
    tagline: 'The future, on display.',
    desc: 'Humanoids, bionic limbs, defence tech and space hardware from labs and companies worldwide. Touch, test and talk to the people behind the machines.',
    chips: ['Robots', 'Space', 'Defence', 'Bionics'],
  },
  {
    name: 'Robowars', color: '#ff4d6d', shape: 'box',
    tagline: 'Last bot standing.',
    desc: 'The international robot combat championship. Heavy metal, spinning weapons and a roaring crowd around the arena.',
    chips: ['Combat', 'Arena', 'Live'],
  },
  {
    name: 'Technoholix', color: '#ff5cc8', shape: 'ico',
    tagline: 'When the sun sets, the stage lights up.',
    desc: 'Nights of concerts, EDM, laser shows and international performers that turn the campus into one giant celebration.',
    chips: ['Concerts', 'EDM', 'Light shows'],
  },
];

export const stats = [
  { n: 180, suffix: 'K+', label: 'Annual footfall' },
  { n: 2500, suffix: '+', label: 'Colleges across India' },
  { n: 500, suffix: '+', label: 'International colleges' },
  { n: 1998, suffix: '', label: 'Year it all began' },
];

export const home = { name: 'Mumbai', lat: 19.13, lon: 72.91 };
export const cities = [
  { name: 'London', lat: 51.5, lon: -0.12 },
  { name: 'New York', lat: 40.7, lon: -74 },
  { name: 'Tokyo', lat: 35.7, lon: 139.7 },
  { name: 'Singapore', lat: 1.35, lon: 103.8 },
  { name: 'Dubai', lat: 25.2, lon: 55.3 },
  { name: 'Sydney', lat: -33.9, lon: 151.2 },
  { name: 'Berlin', lat: 52.5, lon: 13.4 },
  { name: 'San Francisco', lat: 37.8, lon: -122.4 },
  { name: 'Nairobi', lat: -1.3, lon: 36.8 },
  { name: 'Sao Paulo', lat: -23.5, lon: -46.6 },
  { name: 'Seoul', lat: 37.6, lon: 127 },
];
