import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Link } from '@heroui/react';
import { Search, Book, FileText, HelpCircle } from 'lucide-react';
import { PharmoraEntityAPI } from '../../js/services/entity/entity.api.js';

export default function Library() {
  const [entities, setEntities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('All');

  useEffect(() => {
    async function load() {
      if (typeof PharmoraEntityAPI !== 'undefined') {
        const list = await PharmoraEntityAPI.listEntities().catch(() => []);
        setEntities(list);
        setFiltered(list);
      }
    }
    load();

    // Check query params
    const queryParams = new URLSearchParams(window.location.search);
    const q = queryParams.get('q');
    if (q) setSearchQuery(q);
  }, []);

  useEffect(() => {
    let result = entities;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      result = result.filter(e => 
        (e.name && e.name.toLowerCase().includes(qLower)) ||
        (e.description && e.description.toLowerCase().includes(qLower)) ||
        (e.type && e.type.toLowerCase().includes(qLower))
      );
    }
    if (activeType !== 'All') {
      result = result.filter(e => e.type === activeType);
    }
    setFiltered(result);
  }, [searchQuery, activeType, entities]);

  const getEntityIcon = (type) => {
    switch (type) {
      case 'Course': return Book;
      case 'Resource': return FileText;
      default: return HelpCircle;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-text">Open Knowledge Library</h1>
        <p className="text-text-soft text-sm">Browse open syllabus entities, notes, MCQs, and resources.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library resources..."
            startContent={<Search className="text-text-muted w-5 h-5" />}
            size="md"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
          {['All', 'Course', 'Resource', 'MCQ'].map(type => (
            <Button
              key={type}
              onClick={() => setActiveType(type)}
              color={activeType === type ? 'primary' : 'default'}
              variant={activeType === type ? 'solid' : 'flat'}
              size="sm"
              className="font-bold"
            >
              {type}s
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((entity, idx) => {
            const Icon = getEntityIcon(entity.type);
            return (
              <Card key={idx} className="bg-surface border border-border p-4 hover:border-primary/50 transition-all flex flex-col justify-between min-h-[160px]">
                <CardHeader className="flex gap-3 items-start">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="font-extrabold text-base text-text leading-tight">{entity.name}</h3>
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">{entity.type}</span>
                  </div>
                </CardHeader>
                <CardBody className="py-2 text-left flex-1">
                  <p className="text-text-soft text-xs leading-relaxed line-clamp-3">
                    {entity.description || 'No description provided.'}
                  </p>
                </CardBody>
                <div className="pt-2 flex justify-end">
                  <Button as={Link} href={`/library/view.html?id=${entity.id}`} size="sm" variant="light" className="text-primary font-bold text-xs">
                    View Details →
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-text-soft">
            No entities match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
