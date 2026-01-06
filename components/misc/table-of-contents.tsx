'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Heading = {
  id: string;
  text: string;
  level: number;
};

const TableOfContents = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('article h1, article h2, article h3'));
      
      const extractedHeadings = elements.map((elem, index) => {
        if (!elem.id) {
          elem.id = `heading-${index}`;
        }
        
        return {
          id: elem.id,
          text: elem.textContent || "",
          level: parseInt(elem.tagName.replace('H', ''))
        };
      });

      setHeadings(extractedHeadings);
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h4 className="text-lg font-bold leading-snug tracking-tight mb-4 text-gray-900">
        ToC
      </h4>
      <nav>
        <ul className="space-y-2 text-sm border-l border-gray-100 ml-1">
          {headings.map((heading, index) => {
            const isRoot = index === 0;
            return (
              <li 
                key={`${heading.id}-${index}`} 
                style={{ 
                  paddingLeft: isRoot ? '0' : `${(heading.level - 1) * 0.75}rem`,
                }}
                className="list-none"
              >
                <a 
                  href={`#${heading.id}`} 
                  className={`flex items-baseline transition-all duration-200 ${
                    isRoot 
                      ? "font-semibold text-gray-900 hover:text-blue-600" 
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  {!isRoot && <span className="mr-2 text-gray-300 font-light">—</span>}
                  <span className="truncate">{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
