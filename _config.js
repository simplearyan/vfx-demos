/**
 * _config.js - Configuration for VFX Lab
 */
module.exports = {
    title: "VFX Lab",
    description: "Hierarchical collection of 130+ canvas and visual effect experiments.",
    baseUrl: ".", // Can be updated if deployed to a subpath
    
    // Metadata overrides for top-level folders
    categories: {
        'Canvas_Animations': {
            label: 'Canvas Animations',
            icon: '🎨',
            desc: 'Character animations, physics, and interactive sketches.'
        },
        'Math_VFX': {
            label: 'Mathematical VFX',
            icon: '🔢',
            desc: 'Visualizing formulas, waves, and geometric systems.'
        },
        'gsap': {
            label: 'GSAP Motion',
            icon: '⚡',
            desc: 'High-performance web animations using GSAP.'
        },
        'Inverse_Kinematics': {
            label: 'Procedural Animation',
            icon: '🦴',
            desc: 'Bones, IK systems, and biological movement.'
        }
    }
};
