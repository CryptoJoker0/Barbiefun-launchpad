const fs = require('fs');

let css = fs.readFileSync('artifacts/launchpad/src/index.css', 'utf8');

css = css.replace(/--background: 330 60% 97%;/, '--background: 330 100% 98%;');
css = css.replace(/--foreground: 330 25% 15%;/, '--foreground: 330 40% 15%;');

css = css.replace(/--border: 330 50% 88%;/, '--border: 330 70% 92%;');

css = css.replace(/--card-foreground: 330 25% 15%;/, '--card-foreground: 330 40% 15%;');
css = css.replace(/--card-border: 330 50% 88%;/, '--card-border: 330 70% 92%;');

css = css.replace(/--sidebar-foreground: 330 25% 15%;/, '--sidebar-foreground: 330 40% 15%;');
css = css.replace(/--sidebar-border: 330 50% 88%;/, '--sidebar-border: 330 70% 92%;');
css = css.replace(/--sidebar-primary: 330 86% 60%;/, '--sidebar-primary: 330 85% 60%;');
css = css.replace(/--sidebar-accent: 330 60% 94%;/, '--sidebar-accent: 330 100% 95%;');
css = css.replace(/--sidebar-accent-foreground: 330 25% 15%;/, '--sidebar-accent-foreground: 330 40% 15%;');
css = css.replace(/--sidebar-ring: 330 86% 60%;/, '--sidebar-ring: 330 85% 60%;');

css = css.replace(/--popover-foreground: 330 25% 15%;/, '--popover-foreground: 330 40% 15%;');
css = css.replace(/--popover-border: 330 50% 88%;/, '--popover-border: 330 70% 92%;');

css = css.replace(/--primary: 330 86% 60%;/, '--primary: 330 85% 60%;');

css = css.replace(/--secondary: 330 60% 94%;/, '--secondary: 330 100% 95%;');
css = css.replace(/--secondary-foreground: 330 25% 15%;/, '--secondary-foreground: 330 40% 15%;');

css = css.replace(/--muted: 330 40% 95%;/, '--muted: 330 80% 96%;');
css = css.replace(/--muted-foreground: 330 20% 50%;/, '--muted-foreground: 330 30% 45%;');

css = css.replace(/--accent: 330 86% 60%;/, '--accent: 330 100% 94%;');
css = css.replace(/--accent-foreground: 0 0% 100%;/, '--accent-foreground: 330 40% 15%;');

css = css.replace(/--destructive: 0 84% 55%;/, '--destructive: 340 85% 60%;');

css = css.replace(/--input: 330 50% 88%;/, '--input: 330 70% 92%;');
css = css.replace(/--ring: 330 86% 60%;/, '--ring: 330 85% 60%;');

css = css.replace(/--shadow-2xs: 0px 1px 3px 0px rgba\(236,72,153,0\.08\);/, '--shadow-2xs: 0px 1px 3px 0px rgba(244,114,182,0.15);');
css = css.replace(/--shadow-xs: 0px 2px 4px 0px rgba\(236,72,153,0\.10\);/, '--shadow-xs: 0px 2px 4px 0px rgba(244,114,182,0.20);');
css = css.replace(/--shadow-sm: 0px 2px 8px 0px rgba\(236,72,153,0\.12\), 0px 1px 2px -1px rgba\(236,72,153,0\.08\);/, '--shadow-sm: 0px 2px 8px 0px rgba(244,114,182,0.25), 0px 1px 2px -1px rgba(244,114,182,0.15);');
css = css.replace(/--shadow: 0px 4px 12px 0px rgba\(236,72,153,0\.15\), 0px 1px 2px -1px rgba\(236,72,153,0\.10\);/, '--shadow: 0px 4px 12px 0px rgba(244,114,182,0.30), 0px 1px 2px -1px rgba(244,114,182,0.20);');
css = css.replace(/--shadow-md: 0px 6px 18px 0px rgba\(236,72,153,0\.15\), 0px 2px 4px -1px rgba\(236,72,153,0\.10\);/, '--shadow-md: 0px 6px 18px 0px rgba(244,114,182,0.35), 0px 2px 4px -1px rgba(244,114,182,0.25);');
css = css.replace(/--shadow-lg: 0px 10px 28px 0px rgba\(236,72,153,0\.18\), 0px 4px 6px -1px rgba\(236,72,153,0\.12\);/, '--shadow-lg: 0px 10px 28px 0px rgba(244,114,182,0.40), 0px 4px 6px -1px rgba(244,114,182,0.30);');
css = css.replace(/--shadow-xl: 0px 16px 40px 0px rgba\(236,72,153,0\.20\), 0px 8px 10px -1px rgba\(236,72,153,0\.14\);/, '--shadow-xl: 0px 16px 40px 0px rgba(244,114,182,0.45), 0px 8px 10px -1px rgba(244,114,182,0.35);');
css = css.replace(/--shadow-2xl: 0px 24px 60px 0px rgba\(236,72,153,0\.25\);/, '--shadow-2xl: 0px 24px 60px 0px rgba(244,114,182,0.50);');

css = css.replace(/#ec4899, #db2777, #ffffff, #ec4899/g, '#f472b6, #db2777, #fbcfe8, #f472b6');

fs.writeFileSync('artifacts/launchpad/src/index.css', css, 'utf8');
