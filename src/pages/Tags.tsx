
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Mock data for tags
const mockTags = [
  { id: 1, name: "javascript", count: 1420 },
  { id: 2, name: "react", count: 892 },
  { id: 3, name: "node.js", count: 754 },
  { id: 4, name: "typescript", count: 621 },
  { id: 5, name: "html", count: 598 },
  { id: 6, name: "css", count: 587 },
  { id: 7, name: "python", count: 452 },
  { id: 8, name: "vue.js", count: 321 },
  { id: 9, name: "angular", count: 298 },
  { id: 10, name: "mongodb", count: 276 },
  { id: 11, name: "sql", count: 254 },
  { id: 12, name: "php", count: 224 },
  { id: 13, name: "java", count: 212 },
  { id: 14, name: "c#", count: 198 },
  { id: 15, name: "ruby", count: 187 },
  { id: 16, name: "swift", count: 163 },
  { id: 17, name: "kotlin", count: 142 },
  { id: 18, name: "flutter", count: 132 },
  { id: 19, name: "docker", count: 119 },
  { id: 20, name: "aws", count: 109 },
];

const Tags = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const filteredTags = mockTags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tags</h1>
            <p className="text-gray-600 mb-6">
              A tag is a keyword or label that categorizes your question with other, similar questions. 
              Using the right tags makes it easier for others to find and answer your question.
            </p>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Filter by tag name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <Link 
                to={`/questions?tag=${tag.name}`} 
                key={tag.id}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-tech-primary transition-colors"
              >
                <div className="mb-2">
                  <Badge variant="outline" className="bg-tech-light text-tech-primary">
                    {tag.name}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {tag.count} {tag.count === 1 ? 'question' : 'questions'}
                </p>
              </Link>
            ))}
          </div>
          
          {filteredTags.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">No tags found matching "{searchTerm}"</p>
              <p className="text-sm text-gray-400">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tags;
