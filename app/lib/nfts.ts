export interface AuraNFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  attributes: { traitType: string; value: string }[];
}

export const AURA_NFTS: AuraNFT[] = [
  {
    tokenId: 1,
    name: 'Artistic-Auras #6',
    description: 'An abstract representation of cosmic birth, capturing the dynamic eruption of energy and life. A fiery orb at the center radiates explosive forces, sending waves of energy into space, intertwined with branching tendrils that evoke organic growth. The swirling colors of red, yellow, and orange dominate the composition, symbolizing the intense power of creation, while distant celestial orbs highlight the vast, interconnected nature of the universe. The piece evokes both chaos and harmony, illustrating the cycle of destruction and creation.',
    image: 'ipfs://QmWK6YNnU7DzY12vAXMZ8QFCjNHfkAzkedmgmfDa8qDkjP',
    attributes: [{ traitType: 'Color Scheme', value: 'Red, Yellow, Orange, Black, Blue' }, { traitType: 'Energy Source', value: 'Fiery Orb' }, { traitType: 'Element', value: 'Cosmic Tendrils' }, { traitType: 'Form', value: 'Organic Energy Flow' }, { traitType: 'Mood', value: 'Fiery, Explosive, Creation' }, { traitType: 'Theme', value: 'Cosmic Birth, Energy, Creation' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 2,
    name: 'Artistic-Auras #8',
    description: 'An abstract depiction of cosmic energy streams converging beneath a radiant celestial orb. Vibrant waves of blue, red, and golden hues flow from the center of the composition, symbolizing the interconnectedness of celestial forces. The central orb, reminiscent of a sun or planetary core, casts light and energy into the surrounding space. The piece evokes movement, creation, and cosmic balance, with organic, flowing forms representing the perpetual flow of energy across the universe.',
    image: 'ipfs://QmXL6rbv4h7kFjBSCqAkpYMTSqvtVjiLAGTTc31rosxFn1',
    attributes: [{ traitType: 'Color Scheme', value: 'Blue, Red, Yellow, Gold, Orange' }, { traitType: 'Energy Source', value: 'Celestial Orb' }, { traitType: 'Element', value: 'Cosmic Energy Streams' }, { traitType: 'Form', value: 'Flowing, Organic Tendrils' }, { traitType: 'Mood', value: 'Dynamic, Energetic, Mystical' }, { traitType: 'Theme', value: 'Cosmic Flow, Energy, Creation' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 3,
    name: 'Artistic-Auras #10',
    description: 'An abstract visualization of a powerful cosmic vortex, swirling with vibrant energy at the center of the composition. Warm shades of orange and yellow mix with cool blues and grays, creating a dynamic sense of motion. The central vortex appears to pull in celestial bodies, represented by orbs and planetary shapes, into its gravitational whirlpool. The contrasting dark and light elements reflect the balance between chaos and order in the universe. This piece captures the immense power and mystery of galactic phenomena.',
    image: 'ipfs://QmeySLQ3Zt5sSfZYvBuxEHvCSQyYAKmD4eYQxDmkGwcBwH',
    attributes: [{ traitType: 'Color Scheme', value: 'Orange, Yellow, Blue, Black, Gray' }, { traitType: 'Energy Source', value: 'Galactic Vortex' }, { traitType: 'Element', value: 'Cosmic Swirl, Celestial Orbs' }, { traitType: 'Form', value: 'Spiral Energy, Gravitational Pull' }, { traitType: 'Mood', value: 'Chaotic, Powerful, Mystical' }, { traitType: 'Theme', value: 'Galactic Energy, Cosmic Balance, Celestial Movement' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 4,
    name: 'Artistic-Auras #14',
    description: 'An abstract portrayal of cosmic energy and creation, centered around a radiant, sun-like orb. Surrounding the core are swirling waves of dark red and black, alongside clusters of spherical forms that resemble planets or celestial bodies. The flowing energy gives the impression of cosmic forces in motion, with a blend of warmth and mystery. The juxtaposition of light and shadow suggests the birth of new worlds or the flow of energy throughout the universe, blending themes of creation, destruction, and renewal.',
    image: 'ipfs://QmXgqYmGioEaGdrsLPtdy4LFR4S8FjR6mKzAQwUANDiFtD',
    attributes: [{ traitType: 'Color Scheme', value: 'Beige, Black, Red, Orange, Yellow' }, { traitType: 'Energy Source', value: 'Radiant Core' }, { traitType: 'Element', value: 'Cosmic Spheres, Flowing Energy' }, { traitType: 'Form', value: 'Swirling Waves, Orbital Motion' }, { traitType: 'Mood', value: 'Mystical, Expansive, Cosmic' }, { traitType: 'Theme', value: 'Creation, Cosmic Flow, Celestial Forces' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 5,
    name: 'Artistic-Auras #17',
    description: 'An abstract cosmic landscape featuring dynamic cracks in space, intertwining with celestial bodies and glowing orbs. The composition suggests an energetic disruption in the cosmos, with vibrant red and orange spheres floating amidst black, root-like tendrils that seem to both connect and fracture the space. The use of light and dark creates an energetic contrast, symbolizing the balance between chaos and harmony in the universe. The vibrant hues and bold geometric elements evoke a sense of cosmic evolution and celestial conflict.',
    image: 'ipfs://QmebjdN1iUw6SwDesQb4CyL6gknGk2ytf6FKfvGHCPEp23',
    attributes: [{ traitType: 'Color Scheme', value: 'Black, White, Red, Orange, Yellow' }, { traitType: 'Energy Source', value: 'Celestial Orbs' }, { traitType: 'Element', value: 'Cracked Space, Planetary Spheres' }, { traitType: 'Form', value: 'Fractured Energy, Spherical Orbits' }, { traitType: 'Mood', value: 'Dynamic, Chaotic, Expansive' }, { traitType: 'Theme', value: 'Cosmic Disruption, Energy Flow, Balance of Forces' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 6,
    name: 'Artistic-Auras #19',
    description: 'An abstract and surreal depiction of a serpent-like form coiling through space and time, surrounded by dynamic energy bursts and celestial elements. The central figure, adorned with sharp, geometric shapes and rich reds and blacks, seems to ripple through the canvas, symbolizing both danger and creation. The composition blends organic and cosmic themes, with cracks of energy radiating outward, intertwining with orbs and geometric forms. The artwork suggests the eternal passage of time and the cyclical nature of existence.',
    image: 'ipfs://QmXmi6XMvWcpwucYYxk1kZuMFk75tmPnKDyNdCRySN23vD',
    attributes: [{ traitType: 'Color Scheme', value: 'Black, Red, Beige, Orange, Green' }, { traitType: 'Energy Source', value: 'Serpent Figure' }, { traitType: 'Element', value: 'Cosmic Orbs, Geometric Shapes' }, { traitType: 'Form', value: 'Coiling Serpent, Energy Cracks' }, { traitType: 'Mood', value: 'Mystical, Powerful, Eternal' }, { traitType: 'Theme', value: 'Time, Cosmic Forces, Eternal Cycle' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 7,
    name: 'Artistic-Auras #31',
    description: 'An abstract cosmic composition centered around a radiant orb, symbolizing the convergence of elemental and celestial forces. Encircling the central sun-like figure are symmetrical patterns of fiery petals and glowing orbs, creating a balance between fire, light, and the organic flow of cosmic energy. The artwork is a dynamic fusion of warm oranges, deep blues, and contrasting whites, with branching tendrils extending outward, suggesting both growth and the interconnectedness of cosmic realms. Mysterious symbols and geometric elements enhance the mystical and celestial nature of the piece.',
    image: 'ipfs://QmagsTnfGgCkHrffWozeB6in6EghHBSLZVdEL8FXWJbw95',
    attributes: [{ traitType: 'Color Scheme', value: 'Orange, Yellow, Blue, Black, White' }, { traitType: 'Energy Source', value: 'Central Sun' }, { traitType: 'Element', value: 'Fiery Petals, Celestial Orbs, Cosmic Tendrils' }, { traitType: 'Form', value: 'Symmetrical Pattern, Radiating Energy' }, { traitType: 'Mood', value: 'Mystical, Cosmic, Balanced' }, { traitType: 'Theme', value: 'Cosmic Balance, Elemental Forces, Mysticism' }, { traitType: 'Movement', value: 'Abstract Expressionism, Surrealism' }],
  },
  {
    tokenId: 8,
    name: 'Artistic-Auras #33',
    description: 'An abstract depiction of the explosive force of creation, represented by a volcanic eruption of vibrant, swirling energy. At the center of the composition, circular forms resembling celestial orbs rise from a dark volcanic base, radiating fiery hues of orange, red, and yellow. The dynamic shapes suggest both creation and destruction, with swirling tendrils of energy flowing upward, symbolizing cosmic cycles and transformation. The contrast between the vibrant energy and the darker, grounding elements reflects the balance of power and calm, creation and dissolution.',
    image: 'ipfs://QmTRhUorSZ4GeSjytsSuG2SuiMxDAX6gSoXRsgK6iz3Prx',
    attributes: [{ traitType: 'Color Scheme', value: 'Orange, Red, Yellow, Black, Green' }, { traitType: 'Energy Source', value: 'Volcanic Core' }, { traitType: 'Element', value: 'Fiery Orbs, Swirling Tendrils' }, { traitType: 'Form', value: 'Circular Energy, Erupting Force' }, { traitType: 'Mood', value: 'Dynamic, Fiery, Transformative' }, { traitType: 'Theme', value: 'Creation and Destruction, Cosmic Energy, Transformation' }, { traitType: 'Movement', value: 'Abstract Expressionism, Cosmic Surrealism' }],
  },
  {
    tokenId: 9,
    name: 'Artistic-Auras #35',
    description: 'An abstract and surreal representation of the fusion between cosmic forces and geometric structures. The composition is centered around a radiant orb, with tendrils of energy and branches of dark matter connecting vibrant spherical planets and sharp, crystalline geometric shapes. The swirling energy flows through a palette of fiery oranges and yellows, while cool blues and intricate black lines add contrast and depth. This artwork reflects the balance between chaos and order, the organic and the structured, suggesting the underlying geometry that governs the universe.',
    image: 'ipfs://Qmf2zhNyuDCzg9F6a5JW9rtyYhMTWSfkWj9DDKLkgAmGmR',
    attributes: [{ traitType: 'Color Scheme', value: 'Orange, Yellow, Black, Blue' }, { traitType: 'Energy Source', value: 'Radiant Orb' }, { traitType: 'Element', value: 'Geometric Shapes, Planets, Cosmic Tendrils' }, { traitType: 'Form', value: 'Circular Orbs, Geometric Figures' }, { traitType: 'Mood', value: 'Dynamic, Structured, Cosmic' }, { traitType: 'Theme', value: 'Cosmic Geometry, Balance of Chaos and Order, Universal Forces' }, { traitType: 'Movement', value: 'Abstract Expressionism, Geometric Surrealism' }],
  },
  {
    tokenId: 10,
    name: 'Artistic-Auras #39',
    description: 'An abstract representation of a cosmic peak, with a radiant sun emerging from the summit of a towering mountain. The composition features sharp angular elements and orbs, symbolizing celestial bodies, all converging towards the central sun, which emits dynamic rays of energy. The mountain appears to stretch upward as if channeling the cosmic energy from below to the celestial core above. Earth tones of beige and black blend with fiery oranges and yellows, conveying a sense of unity between the terrestrial and the cosmic. The piece evokes themes of ascension, enlightenment, and the power of the natural world in harmony with the universe.',
    image: 'ipfs://QmcJhazfbZpzJHCPNUrSGnZCkE4s8XWaReQmKWQC4kgaWw',
    attributes: [{ traitType: 'Color Scheme', value: 'Beige, Black, Orange, Yellow' }, { traitType: 'Energy Source', value: 'Central Sun' }, { traitType: 'Element', value: 'Mountain, Radiating Energy, Celestial Orbs' }, { traitType: 'Form', value: 'Geometric Shapes, Cosmic Rays, Vertical Ascent' }, { traitType: 'Mood', value: 'Powerful, Majestic, Enlightening' }, { traitType: 'Theme', value: 'Cosmic Ascension, Connection Between Earth and Sky' }, { traitType: 'Movement', value: 'Abstract Expressionism, Cosmic Surrealism' }],
  },
  {
    tokenId: 11,
    name: 'Artistic-Auras #40',
    description: 'A striking abstract representation of cosmic forces in opposition, with a radiant orange sun clashing against a swirling black void. A white figure, representing the human spirit or energy, reaches toward the sun as a dark energy appears to pull it into the shadowy void. The composition features sharp contrasts between light and dark, representing duality and the interplay between creation and destruction. The flowing lines and splashes of color evoke movement, while the juxtaposition of cosmic elements and human form speaks to themes of transformation and existential tension.',
    image: 'ipfs://QmV8JQ4MzvfHhhpxNCueQ1Rv8CZrcDGsw2Qdb5LC1dm38K',
    attributes: [{ traitType: 'Color Scheme', value: 'Black, White, Orange, Yellow' }, { traitType: 'Energy Source', value: 'Central Sun' }, { traitType: 'Element', value: 'Void, Cosmic Force, Human Figure' }, { traitType: 'Form', value: 'Fluid Shapes, Cosmic Pull' }, { traitType: 'Mood', value: 'Tense, Dynamic, Transformative' }, { traitType: 'Theme', value: 'Duality, Cosmic Struggle, Transformation' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 12,
    name: 'Artistic-Auras #43',
    description: 'An abstract composition blending organic shapes with geometric forms, highlighting vibrant, glowing orbs and polyhedral structures. The artwork features spheres, pyramids, and cubes in fiery orange and cool blue tones, surrounded by dark, vein-like roots. A radiant sun-like orb in the top left corner emanates light, while the other elements flow outward, representing the interplay of geometry and organic matter. The art conveys the idea of energy flow, creation, and cosmic order with a mix of natural and mathematical forms.',
    image: 'ipfs://QmetZgUdsPyBUcoNXqwPdkCy8EVRuyGjsMbSqKQftR1y9m',
    attributes: [{ traitType: 'Color Scheme', value: 'Fiery Oranges, Cool Blues, Dark Blacks, Warm Yellows' }, { traitType: 'Energy Source', value: 'Radiant Sun-like Orb' }, { traitType: 'Element', value: 'Geometric Shapes (Spheres, Polyhedrons, Cubes)' }, { traitType: 'Form', value: 'Organic and Angular Forms' }, { traitType: 'Mood', value: 'Dynamic, Cosmic, Creative' }, { traitType: 'Theme', value: 'Cosmic Geometry, Energy Flow, Universal Balance' }, { traitType: 'Movement', value: 'Abstract Surrealism' }],
  },
  {
    tokenId: 13,
    name: 'Artistic-Auras #49',
    description: 'This abstract cosmic piece depicts a swirling mass of planets, stars, and energetic light forms. The warm yellow-orange circles suggest celestial bodies in motion, while smaller red, blue, and black spheres orbit the main glowing figures. Dark, smoky tendrils emanate from the central forms, intertwining the orbits and creating a sense of dynamic energy. The background features soft gradients of light gray, allowing the vibrant colors of the celestial bodies to stand out. The drips of orange and black create a feeling of cosmic movement, as if the scene is melting or expanding into the void.',
    image: 'ipfs://QmXeZpYJ9WfnChLBzPYbUhL2YDiDVBZJTfdhYJXvsEjEt8',
    attributes: [{ traitType: 'Color Scheme', value: 'Warm Oranges, Blues, Reds, Grays, and Black' }, { traitType: 'Energy Source', value: 'Celestial Orbits, Planets, Stars' }, { traitType: 'Element', value: 'Swirling Motion, Orbiting Spheres, Energetic Lines' }, { traitType: 'Form', value: 'Circular Celestial Bodies, Smoky Tendrils, Dripping Energy' }, { traitType: 'Mood', value: 'Dynamic, Chaotic, Cosmic' }, { traitType: 'Theme', value: 'Celestial Motion, Cosmic Energy, Orbiting Bodies' }, { traitType: 'Movement', value: 'Cosmic Surrealism with Abstract Expressionism Elements' }],
  },
  {
    tokenId: 14,
    name: 'Artistic-Auras #63',
    description: 'This abstract digital artwork juxtaposes organic and mechanical elements in a surreal dance of creation and destruction. Dominating the center is a large gear-like structure with glowing orbs that evoke the feeling of both cosmic forces and mechanical processes at play. On either side, serpentine forms writhe upwards, their dark lines hinting at both energy and organic growth. The center features a dark figure, possibly mechanical or otherworldly, as bright red tendrils of energy emanate from its core, connecting the orbs in a dynamic swirl of color. The interplay between organic and mechanical motifs suggests a narrative of transformation and the fusion of natural and artificial worlds.',
    image: 'ipfs://QmcWUdtQdHFSfbbZqdDbpdzxp2Nb1Mg1yTaf5VpkvKMk6M',
    attributes: [{ traitType: 'Color Scheme', value: 'Red, Black, Orange, Beige, Yellow' }, { traitType: 'Energy Source', value: 'Gears, Orbs, Tendrils, Serpentine Energy' }, { traitType: 'Element', value: 'Fusion of Organic and Mechanical, Creation and Destruction, Energy Flow' }, { traitType: 'Form', value: 'Dynamic, Central Gear, Organic Movements' }, { traitType: 'Mood', value: 'Chaotic, Transformative, Mechanical' }, { traitType: 'Theme', value: 'Cosmic Mechanics, Creation, Fusion of Worlds' }, { traitType: 'Movement', value: 'Surreal Abstract Art' }],
  },
  {
    tokenId: 15,
    name: 'Artistic-Auras #67',
    description: 'This abstract artwork captures the contrast between organic and geometric forms, portraying a brilliant sun radiating fiery energy across the canvas. A powerful lightning-like force extends from the sun, connecting with an explosion of dark red and blue spheres that are tangled in branching black tendrils. On the right side, a series of light blue geometric shapes appear to float, giving a sense of balance against the chaotic energy. The background features a gradient of warm oranges and cool grays, symbolizing the duality of opposing forces in the cosmos.',
    image: 'ipfs://QmcHb81wZefNrqGBjx3rTBzkUDqPPWJm4GtPJ3e4hb6ntT',
    attributes: [{ traitType: 'Color Scheme', value: 'Orange, Yellow, Red, Black, Blue, White, Gray' }, { traitType: 'Energy Source', value: 'Sun, Energy, Spheres, Geometric Shapes, Lightning' }, { traitType: 'Element', value: 'Celestial Power, Energy Flow, Geometric Forms' }, { traitType: 'Form', value: 'Organic vs Geometric, Radiating Energy' }, { traitType: 'Mood', value: 'Dynamic, Chaotic, Balanced' }, { traitType: 'Theme', value: 'Cosmic Forces, Energy and Form, Chaos and Order' }, { traitType: 'Movement', value: 'Abstract Cosmic Art, Surrealist Dualism' }],
  },
  {
    tokenId: 16,
    name: 'Artistic-Auras #70',
    description: 'An intricate surreal representation of a tree-like figure intertwined with mechanical elements, symbolizing the fusion of life and technology. The central figure resembles a robotic character with a glowing orb in the chest, encased in a network of spheres, branches, and wires. The branches extend outward, each holding circular elements that represent celestial bodies or orbs. The background showcases a soft transition of light, evoking an ethereal cosmic landscape. Birds made of dark geometric shapes soar in the distance, adding a contrast between the organic and mechanical themes.',
    image: 'ipfs://Qmb3TxBsNaKcR3K5VewUkMFE5G2LTKvaHnuv4yoySFWPh2',
    attributes: [{ traitType: 'Color Scheme', value: 'Teal, Orange, Blue, Black, Yellow' }, { traitType: 'Energy Source', value: 'Tree, Robot, Orbs, Birds, Celestial Bodies' }, { traitType: 'Element', value: 'Mechanical Forms, Organic Branches, Energy Spheres' }, { traitType: 'Form', value: 'Geometric, Branching, Circular Orbs' }, { traitType: 'Mood', value: 'Reflective, Mystical, Futuristic' }, { traitType: 'Theme', value: 'Fusion of Nature and Technology, Cosmic Life Force, Evolution of Life' }, { traitType: 'Movement', value: 'Abstract Futurism, Surreal Technology' }],
  },
  {
    tokenId: 17,
    name: 'Artistic-Auras #92',
    description: 'This abstract artwork represents a cosmic scene where a central glowing orb emits radiant energy waves through intertwining black and dark energy streams. The black and fiery orange swirls appear to encapsulate the celestial orbs, suggesting the formation or collapse of a star or cosmic entity. The use of light contrasts with the darker, shadowy tendrils extending outward, and soft geometric shapes fade into the background. Dripping textures along the lower section contribute to a sense of decay or transformation. The image gives off a blend of chaos and order, encapsulating the cycle of cosmic events.',
    image: 'ipfs://QmWsReQaPWeCUXiNd4mHVbdWitX7VuMMg9WXKW1xZobHiu',
    attributes: [{ traitType: 'Color Scheme', value: 'Black, White, Grey, Fiery Orange, Yellow, Light Beige' }, { traitType: 'Energy Source', value: 'Radiant Star or Energy Orb, Cosmic Tendrils, Dripping Shadows, Abstract Planets, Geometric Forms' }, { traitType: 'Element', value: 'Light and Dark Energy Streams, Radiant Central Glow, Geometric Patterns in the Background, Dripping Shadows' }, { traitType: 'Form', value: 'Circular, Twisting, Flowing, Dynamic' }, { traitType: 'Mood', value: 'Mysterious, Chaotic, Energetic, Transformative' }, { traitType: 'Theme', value: 'Cosmic Forces, Energy Fields, Creation, Destruction, Universal Balance' }, { traitType: 'Movement', value: 'Expanding Energy, Twisting Motion, Flow of Cosmic Forces' }],
  },
  {
    tokenId: 18,
    name: 'Artistic-Auras #93',
    description: 'This abstract cosmic artwork displays a symmetrical composition featuring two glowing orbsone red-orange and the other black with a central fiery glowaligned vertically. Both orbs are surrounded by intricate branching patterns resembling energy surges or solar flares that seem to emanate from the central axis. The background features swirling patterns in soft grays, creams, and oranges that create a sense of motion and cosmic force. The artwork conveys a balance between opposing forces, evoking ideas of cosmic duality, energy, and creation. The design integrates both organic forms and sharp geometric elements that heighten the dynamic feel of the piece.',
    image: 'ipfs://Qma3QJwzxdH2QPMHXKFqEEF6JNXf6GDomjk2v6n3NypuSo',
    attributes: [{ traitType: 'Color Scheme', value: 'Red-Orange, Black, Cream, Gray, Soft Blue' }, { traitType: 'Energy Source', value: 'Solar Orbs, Energy Waves, Branching Tendrils, Flame Patterns' }, { traitType: 'Element', value: 'Dual Orbs, Symmetry, Geometric Shapes, Flowing Energy Lines' }, { traitType: 'Form', value: 'Symmetrical, Radial, Flowing, Dynamic' }, { traitType: 'Mood', value: 'Intense, Balanced, Mysterious, Energetic' }, { traitType: 'Theme', value: 'Energy Balance, Duality, Cosmic Symmetry, Solar Forces' }, { traitType: 'Movement', value: 'Radial Energy Expansion, Flowing Waves' }],
  },
  {
    tokenId: 19,
    name: 'Artistic-Auras #120',
    description: 'An abstract exploration of cosmic forces, depicting planets or celestial bodies in alignment. The bold orbs of yellow, red, and teal seem to float in a void-like space, connected by thin lines of energy and surrounded by splashes of vibrant color. The dark background creates a stark contrast, emphasizing the glow and energy of the central elements. The image evokes themes of celestial balance, cosmic connections, and the mysteries of space.',
    image: 'ipfs://QmdGVV9wGm2QtiDCqeXQpJi47DYkfRp9cZ5KjWZw9qYt25',
    attributes: [{ traitType: 'Color Scheme', value: 'Black, Yellow, Red, Teal, Orange' }, { traitType: 'Energy Source', value: 'Celestial Bodies, Planetary Alignment' }, { traitType: 'Element', value: 'Planets, Orbs, Energetic Lines' }, { traitType: 'Form', value: 'Spherical, Floating, Circular Motion' }, { traitType: 'Mood', value: 'Mystical, Contemplative, Cosmic' }, { traitType: 'Theme', value: 'Space, Cosmic Balance, Energy, Alignment' }, { traitType: 'Movement', value: 'Abstract Expressionism, Cosmic Art' }],
  },
  {
    tokenId: 20,
    name: 'Artistic-Auras #178',
    description: 'This abstract artwork showcases a central burst of vivid colors, evoking the imagery of an explosion or energy surge. The composition blends warm hues like fiery reds, oranges, and yellows with cooler tones such as black, teal, and beige. The jagged lines and erratic splashes of paint give a sense of chaos and intensity. The soft, diffused background contrasts with the vibrant energy of the central explosion, creating a striking visual balance.',
    image: 'ipfs://QmTRbVBbn4zE1e4TV711PBRTV5VDNtB4FSqBrn1PYzFjPL',
    attributes: [{ traitType: 'Color Scheme', value: 'Warm oranges, reds, and yellows contrasted with blacks, beige, and muted teal' }, { traitType: 'Energy Source', value: 'Energy Explosion, Abstract Form' }, { traitType: 'Element', value: 'Central burst of color, erratic and jagged lines, diffused edges' }, { traitType: 'Form', value: 'Organic, chaotic structure with energetic splatters and flowing strokes' }, { traitType: 'Mood', value: 'Intense, Dynamic, Chaotic' }, { traitType: 'Theme', value: 'Energy, Explosion, Creation, Chaos' }, { traitType: 'Movement', value: 'Abstract Expressionism' }],
  },
  {
    tokenId: 21,
    name: 'Artistic-Auras #443',
    description: 'A glowing white core at the center radiates spiraling streams of fiery orange and black energy. Tendrils intertwine with dripping textures, creating a vivid and dynamic representation of cosmic energy in motion',
    image: 'ipfs://QmVKZ3RASrxsDrjUUfHFyA4WczEpppBW8cAD6kqcEbynkA',
    attributes: [{ traitType: 'Color Scheme', value: 'Bright White, Fiery Orange, Deep Black, Subtle Beige' }, { traitType: 'Energy Source', value: 'Central Luminous Core' }, { traitType: 'Element', value: 'Radiating Tendrils, Dripping Energy, Intertwined Flows' }, { traitType: 'Form', value: 'Central Spiral, Radiating Patterns, Dripping Extensions' }, { traitType: 'Mood', value: 'Intense, Dynamic, Energetic' }, { traitType: 'Theme', value: 'Creation and Chaos, Cosmic Energy, Infinite Expansion' }, { traitType: 'Movement', value: 'Spiraling Outward, Radiant Expansion, Gravitational Drips' }],
  },
];
