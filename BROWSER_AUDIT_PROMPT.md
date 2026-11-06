# 🔍 MASTER BROWSER AUDIT PROMPT

**Paste this into Claude (web version) while viewing http://localhost:3000 to get a complete dashboard audit report.**

---

## 📋 MASTER AUDIT PROMPT

```
You are a UX/Frontend auditor for a SaaS platform (Secure File Exchange).

I'm viewing the live platform at http://localhost:3000. Please examine the 
dashboard and provide a comprehensive audit report covering:

## SECTION 1: VISUAL INSPECTION
- What do you see on the homepage/landing page?
- Describe the header, navigation, hero section
- What colors, fonts, layout are visible?
- Is the Empyrean brand applied (navy #1D2749, cerulean #007599, cream background)?
- Responsive design: Does it look good on mobile/tablet/desktop?

## SECTION 2: NAVIGATION & PAGES
- What pages are accessible from the navigation?
- List every clickable link/button you can see
- Do all links work or are any broken (404/error)?
- What's in the navbar vs sidebar vs footer?
- Navigation structure: Is it logical and easy to understand?

## SECTION 3: FEATURE PAGES
For each page you can access, report:
- Landing page: Hero, features, pricing visible?
- Product/Features page: Describe what's shown
- Security page: Trust badges, compliance info visible?
- Pricing page: 4-plan table visible? Pricing clear?
- Dashboard (if accessible): What sections exist?
  - Stats/Metrics cards visible?
  - User management section?
  - Room/File management?
  - Billing section?
  - Audit log?

## SECTION 4: FORMS & INTERACTIONS
- Sign up form: What fields? Validation working?
- Login form: Email/password fields visible? Remember me option?
- Password reset: Is there a link? Does it work?
- Any forms on the dashboard: Can you interact with them?
- Any errors or error messages displayed?

## SECTION 5: DESIGN QUALITY
- Brand consistency: Is the branding consistent across pages?
- Typography: Fonts readable? Hierarchy clear?
- Spacing/Layout: Margins and padding appropriate?
- Color usage: Colors match Empyrean brand?
- Icons: Any icons used? Do they make sense?
- Buttons: Clear CTAs (Sign Up, Get Started, Try Free)?

## SECTION 6: RESPONSIVENESS
- Mobile view (375px width): Does layout break?
- Tablet view (768px width): Navigation still accessible?
- Desktop view (1440px width): Layout optimal?
- Any text overflow, cut-off content, or layout issues?
- Touch targets: Are buttons large enough for mobile?

## SECTION 7: MISSING OR BROKEN ELEMENTS
- List anything that appears broken (404, error, missing image)
- List any text that says "TODO", "Coming Soon", "[placeholder]"
- List any incomplete features or sections
- List any accessibility issues (missing alt text, low contrast)

## SECTION 8: WHAT'S WORKING WELL
- List 3-5 things that look great
- Describe what's polished and professional
- Highlight good UX decisions

## SECTION 9: WHAT NEEDS FIXING
- List issues by priority: CRITICAL, HIGH, MEDIUM, LOW
- CRITICAL: Broken forms, security issues, 404 pages
- HIGH: Missing key features, visual bugs, responsive issues
- MEDIUM: Minor styling issues, missing sections
- LOW: Polish items, copy refinements

## SECTION 10: SPECIFIC RECOMMENDATIONS
- What should be fixed first?
- What pages/features are most critical?
- What's missing that customers would expect?
- Any quick wins that would improve UX?

## SECTION 11: COMPLIANCE & TRUST SIGNALS
- Is there a Privacy Policy link? Does it exist?
- Is there a Terms of Service link?
- Are trust badges/certifications visible (SSL, SOC 2, HIPAA)?
- Is security information prominent?
- Is the company info (About, Contact) accessible?

## SECTION 12: FINAL ASSESSMENT
Rate each area 1-10:
- Visual Design: __/10
- Navigation/UX: __/10
- Feature Completeness: __/10
- Responsive Design: __/10
- Brand Consistency: __/10
- Trust/Credibility: __/10
- Overall Platform Readiness: __/10

## FORMAT YOUR RESPONSE AS:
[AUDIT REPORT - SECURE FILE EXCHANGE PLATFORM]

### 🎯 SUMMARY
[2-3 sentences on overall state]

### ✅ WORKING WELL
- [Item 1]
- [Item 2]
- [Item 3]

### ⚠️ ISSUES FOUND (BY PRIORITY)

**CRITICAL (Must Fix Before Launch)**
- [ ] Issue 1: Description → Fix: Action needed
- [ ] Issue 2: Description → Fix: Action needed

**HIGH (Important)**
- [ ] Issue 3: Description → Fix: Action needed

**MEDIUM (Nice to Have)**
- [ ] Issue 4: Description → Fix: Action needed

### 🎨 DESIGN ASSESSMENT
- Brand application: [Score/Comment]
- Responsiveness: [Score/Comment]
- Visual polish: [Score/Comment]

### 🚀 RECOMMENDATIONS (In Order)
1. [Top priority action]
2. [Second priority action]
3. [Third priority action]

### 📊 READINESS SCORES
- Visual Design: __/10
- Navigation: __/10
- Features: __/10
- Responsive: __/10
- Brand: __/10
- Trust: __/10
- **OVERALL: __/10**

### 📝 NOTES FOR DEVELOPERS
[Specific technical feedback, code suggestions, components that need work]

---

End of audit report. Please be thorough and specific.
```

---

## HOW TO USE THIS PROMPT

1. **Open Claude in your browser** (claude.ai)
2. **Open the SFX platform** in another tab (http://localhost:3000)
3. **Copy the entire Master Audit Prompt** above (from "You are a UX/Frontend auditor..." to "...End of audit report")
4. **Paste it into Claude** in a new conversation
5. **Send it** and wait for the comprehensive audit report
6. **Claude will examine** the live platform and give you detailed feedback
7. **Share the report** with me and I'll fix everything that needs correcting

---

## WHAT YOU'LL GET BACK

A complete report showing:
- ✅ What's working great
- ⚠️ What's broken or missing
- 🎨 Design feedback
- 📱 Responsive design issues
- 🔐 Security/trust signals
- 🚀 Priority fixes needed
- 📊 Readiness scores

---

## THEN TELL ME:

Once you get the report, paste it here and I'll:
1. **Fix all CRITICAL issues** immediately
2. **Fix all HIGH issues** in next iteration
3. **Continue building Phases 10+** in parallel
4. **Keep servers running** (localhost stays live)
5. **Redeploy and verify** fixes are working

---

**Ready? Go to http://localhost:3000 now, then come back with Claude's audit report!** 🎯
