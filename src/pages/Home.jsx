import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Link } from '@heroui/react';
import { BookOpen, FileText, Layers, Search, Award, HelpCircle } from 'lucide-react';
import { PharmoraEntityAPI } from '../../js/services/entity/entity.api.js';

export default function Home() {
  const [stats, setStats] = useState({ courses: 0, resources: 0, mcqs: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadStats() {
      if (typeof PharmoraEntityAPI !== 'undefined') {
        const list = await PharmoraEntityAPI.listEntities().catch(() => []);
        setStats({
          courses: list.filter(e => e.type === 'Course').length,
          resources: list.filter(e => e.type === 'Resource').length,
          mcqs: list.filter(e => e.type === 'MCQ').length
        });
      }
    }
    loadStats();
  }, []);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/library/?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { title: 'Syllabus & Core', desc: 'PCI syllabus mapping for Course, Semesters and Subjects.', icon: Layers, href: '/learn/', count: stats.courses, label: 'courses' },
    { title: 'Study Notes & Slides', desc: 'Shared monographs, lectures, slides, and reference materials.', icon: BookOpen, href: '/library/', count: stats.resources, label: 'materials' },
    { title: 'Question Banks', desc: 'Practice question sheets and exam syllabus preparation documents.', icon: FileText, href: '/questions/', count: 12, label: 'banks' },
    { title: 'MCQs Practice', desc: 'Mock test questions and quick quizzes for academic training.', icon: HelpCircle, href: '/tests/', count: stats.mcqs, label: 'questions' },
    { title: 'Events & Lectures', desc: 'Seminars, guest lectures, and institutional workshops.', icon: Award, href: '/events/', count: 8, label: 'upcoming' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
      {/* Hero Section */}
      <section className="text-center py-8 flex flex-col gap-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-text">
          Open Pharmacy <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Learning Network</span>
        </h1>
        <p className="text-text-soft text-lg font-medium">
          A collaborative open education space for pharmacy students, teachers, professionals, and contributors.
        </p>

        {/* Global Search Bar */}
        <div className="max-w-xl mx-auto w-full mt-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search syllabus, notes, drugs, jobs... (Enter to search)"
            startContent={<Search className="text-text-muted w-5 h-5" />}
            size="lg"
            radius="lg"
            className="shadow-lg border-border"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-text">Explore Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <Card key={idx} as={Link} href={c.href} isPressable className="bg-surface border border-border hover:border-primary/50 transition-all p-4">
                <CardHeader className="flex gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="font-extrabold text-base text-text">{c.title}</h3>
                    <span className="text-xs text-primary font-bold">{c.count} {c.label}</span>
                  </div>
                </CardHeader>
                <CardBody className="py-2 text-left">
                  <p className="text-text-soft text-sm leading-relaxed">{c.desc}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Contributor Section */}
      <section className="bg-surface border border-border rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mt-6">
        <div className="flex flex-col gap-2 max-w-xl text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Join the network</span>
          <h2 className="text-2xl font-black text-text">🌱 Build the Future of Pharmacy Education</h2>
          <p className="text-text-soft text-sm leading-relaxed">
            Pharmora connects learners, educators, and professionals to write and review open syllabus content. Add notes, MCQs, or build course relationships today.
          </p>
        </div>
        <Button as={Link} href="/community/" color="primary" size="lg" className="font-bold text-sm px-8">
          Become Contributor
        </Button>
      </section>
    </div>
  );
}
