// helpers/svgHelper.js
import fs from 'fs'
import path from 'path'

const getSvg = (name: string, className = '') => {
    try {
        const filePath = path.join(__dirname, '../public/icons', `${name}.svg`);
        let svg = fs.readFileSync(filePath, 'utf8');
        // class inject karo
        svg = svg.replace('<svg', `<svg class="${className}"`);
        return svg;
    } catch (err) {
        return err
    }
};

module.exports = { getSvg };