"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const router = (0, express_1.Router)();
router.get('/dashboard/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalProducts = yield prisma.product.count();
        const activeEvaluations = yield prisma.evaluation.count();
        const internalProjects = yield prisma.internalProject.count();
        const evaluations = yield prisma.evaluation.findMany({
            select: { score: true }
        });
        const avgMetricScore = evaluations.length > 0
            ? (evaluations.reduce((acc, curr) => acc + curr.score, 0) / evaluations.length).toFixed(1)
            : '0.0';
        const recentActivity = yield prisma.evaluation.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { product: true, metric: true }
        });
        res.json({
            totalProducts,
            activeEvaluations,
            internalProjects,
            avgMetricScore,
            recentActivity
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
}));
router.get('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield prisma.product.findMany({
        include: { internalProjects: true, evaluations: true, comments: true, metricGroups: { include: { metrics: true } } }
    });
    res.json(products);
}));
router.post('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { metricGroupIds, internalProjectIds } = _a, data = __rest(_a, ["metricGroupIds", "internalProjectIds"]);
    const product = yield prisma.product.create({
        data: Object.assign(Object.assign({}, data), { metricGroups: metricGroupIds ? { connect: metricGroupIds.map((id) => ({ id })) } : undefined, internalProjects: internalProjectIds ? { connect: internalProjectIds.map((id) => ({ id })) } : undefined })
    });
    res.json(product);
}));
router.put('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { metricGroupIds, internalProjectIds } = _a, data = __rest(_a, ["metricGroupIds", "internalProjectIds"]);
    const product = yield prisma.product.update({
        where: { id: Number(req.params.id) },
        data: Object.assign(Object.assign({}, data), { metricGroups: metricGroupIds ? { set: metricGroupIds.map((id) => ({ id })) } : undefined, internalProjects: internalProjectIds ? { set: internalProjectIds.map((id) => ({ id })) } : undefined })
    });
    res.json(product);
}));
router.delete('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.product.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true });
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product due to a server error' });
    }
}));
router.get('/metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const metrics = yield prisma.metric.findMany({
        include: { groups: true }
    });
    res.json(metrics);
}));
router.post('/metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { groupIds } = _a, data = __rest(_a, ["groupIds"]);
    const metric = yield prisma.metric.create({
        data: Object.assign(Object.assign({}, data), { groups: groupIds ? { connect: groupIds.map((id) => ({ id })) } : undefined })
    });
    res.json(metric);
}));
router.put('/metrics/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { groupIds } = _a, data = __rest(_a, ["groupIds"]);
    const metric = yield prisma.metric.update({
        where: { id: Number(req.params.id) },
        data: Object.assign(Object.assign({}, data), { groups: groupIds ? { set: groupIds.map((id) => ({ id })) } : undefined })
    });
    res.json(metric);
}));
router.delete('/metrics/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.metric.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
}));
router.get('/metric-groups', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield prisma.metricGroup.findMany({
        include: { metrics: true }
    });
    res.json(groups);
}));
router.post('/metric-groups', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { metricIds } = _a, data = __rest(_a, ["metricIds"]);
    const group = yield prisma.metricGroup.create({
        data: Object.assign(Object.assign({}, data), { metrics: metricIds ? { connect: metricIds.map((id) => ({ id })) } : undefined })
    });
    res.json(group);
}));
router.put('/metric-groups/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { metricIds } = _a, data = __rest(_a, ["metricIds"]);
    const group = yield prisma.metricGroup.update({
        where: { id: Number(req.params.id) },
        data: Object.assign(Object.assign({}, data), { metrics: metricIds ? { set: metricIds.map((id) => ({ id })) } : undefined })
    });
    res.json(group);
}));
router.delete('/metric-groups/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.metricGroup.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
}));
router.get('/evaluations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const evaluations = yield prisma.evaluation.findMany({
        include: { product: true, metric: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(evaluations);
}));
router.post('/evaluations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const evaluation = yield prisma.evaluation.create({ data: req.body });
    res.json(evaluation);
}));
router.post('/evaluations/batch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const evaluations = yield prisma.evaluation.createMany({ data: req.body });
    res.json(evaluations);
}));
router.put('/evaluations/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const evaluation = yield prisma.evaluation.update({
        where: { id: Number(req.params.id) },
        data: req.body
    });
    res.json(evaluation);
}));
router.delete('/evaluations/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.evaluation.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
}));
router.post('/evaluations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const evaluation = yield prisma.evaluation.create({ data: req.body });
    res.json(evaluation);
}));
router.post('/evaluations/batch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const evaluations = yield prisma.evaluation.createMany({ data: req.body });
    res.json(evaluations);
}));
router.put('/evaluations/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const evaluation = yield prisma.evaluation.update({
        where: { id: Number(req.params.id) },
        data: req.body
    });
    res.json(evaluation);
}));
router.delete('/evaluations/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.evaluation.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
}));
router.get('/projects', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projects = yield prisma.internalProject.findMany({
        include: { products: true }
    });
    res.json(projects);
}));
router.post('/projects', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { productIds } = _a, data = __rest(_a, ["productIds"]);
    const project = yield prisma.internalProject.create({
        data: Object.assign(Object.assign({}, data), { products: productIds ? { connect: productIds.map((id) => ({ id })) } : undefined })
    });
    res.json(project);
}));
router.put('/projects/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { productIds } = _a, data = __rest(_a, ["productIds"]);
    const project = yield prisma.internalProject.update({
        where: { id: Number(req.params.id) },
        data: Object.assign(Object.assign({}, data), { products: productIds ? { set: productIds.map((id) => ({ id })) } : undefined })
    });
    res.json(project);
}));
router.delete('/projects/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.internalProject.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
}));
router.post('/comments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield prisma.comment.create({ data: req.body });
    res.json(comment);
}));
router.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    res.json(users);
}));
router.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.create({ data: req.body });
    res.json(user);
}));
exports.default = router;
