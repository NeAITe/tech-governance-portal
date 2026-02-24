import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const router = Router();

router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    const activeEvaluations = await prisma.evaluation.count();
    const internalProjects = await prisma.internalProject.count();
    
    const evaluations = await prisma.evaluation.findMany({
      select: { score: true }
    });
    
    const avgMetricScore = evaluations.length > 0 
      ? (evaluations.reduce((acc: number, curr: any) => acc + curr.score, 0) / evaluations.length).toFixed(1)
      : '0.0';

    const recentActivity = await prisma.evaluation.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/products', async (req, res) => {
  const products = await prisma.product.findMany({
    include: { internalProjects: true, evaluations: true, comments: true, metricGroups: { include: { metrics: true } } }
  });
  res.json(products);
});

router.post('/products', async (req, res) => {
  const { metricGroupIds, internalProjectIds, ...data } = req.body;
  const product = await prisma.product.create({ 
    data: {
      ...data,
      metricGroups: metricGroupIds ? { connect: metricGroupIds.map((id: number) => ({ id })) } : undefined,
      internalProjects: internalProjectIds ? { connect: internalProjectIds.map((id: number) => ({ id })) } : undefined
    } 
  });
  res.json(product);
});

router.put('/products/:id', async (req, res) => {
  const { metricGroupIds, internalProjectIds, ...data } = req.body;
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: {
      ...data,
      metricGroups: metricGroupIds ? { set: metricGroupIds.map((id: number) => ({ id })) } : undefined,
      internalProjects: internalProjectIds ? { set: internalProjectIds.map((id: number) => ({ id })) } : undefined
    }
  });
  res.json(product);
});

router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product due to a server error' });
  }
});

    res.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Product not found' });
      }
      console.error('Prisma Error deleting product (Code:', error.code, '):', error);
      return res.status(500).json({ error: `Failed to delete product due to a database constraint or server error (${error.code})` });
    }
    
    console.error('Unknown error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product due to an unknown server error' });
  }
});

router.get('/metrics', async (req, res) => {
  const metrics = await prisma.metric.findMany({
    include: { groups: true }
  });
  res.json(metrics);
});

router.post('/metrics', async (req, res) => {
  const { groupIds, ...data } = req.body;
  const metric = await prisma.metric.create({ 
    data: {
      ...data,
      groups: groupIds ? { connect: groupIds.map((id: number) => ({ id })) } : undefined
    } 
  });
  res.json(metric);
});

router.put('/metrics/:id', async (req, res) => {
  const { groupIds, ...data } = req.body;
  const metric = await prisma.metric.update({
    where: { id: Number(req.params.id) },
    data: {
      ...data,
      groups: groupIds ? { set: groupIds.map((id: number) => ({ id })) } : undefined
    }
  });
  res.json(metric);
});

router.delete('/metrics/:id', async (req, res) => {
  await prisma.metric.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.get('/metric-groups', async (req, res) => {
  const groups = await prisma.metricGroup.findMany({
    include: { metrics: true }
  });
  res.json(groups);
});

router.post('/metric-groups', async (req, res) => {
  const { metricIds, ...data } = req.body;
  const group = await prisma.metricGroup.create({ 
    data: {
      ...data,
      metrics: metricIds ? { connect: metricIds.map((id: number) => ({ id })) } : undefined
    } 
  });
  res.json(group);
});

router.put('/metric-groups/:id', async (req, res) => {
  const { metricIds, ...data } = req.body;
  const group = await prisma.metricGroup.update({
    where: { id: Number(req.params.id) },
    data: {
      ...data,
      metrics: metricIds ? { set: metricIds.map((id: number) => ({ id })) } : undefined
    }
  });
  res.json(group);
});

router.delete('/metric-groups/:id', async (req, res) => {
  await prisma.metricGroup.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.get('/evaluations', async (req, res) => {
  const evaluations = await prisma.evaluation.findMany({
    include: { product: true, metric: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(evaluations);
});

router.post('/evaluations', async (req, res) => {
  const evaluation = await prisma.evaluation.create({ data: req.body });
  res.json(evaluation);
});

router.post('/evaluations/batch', async (req, res) => {
  const evaluations = await prisma.evaluation.createMany({ data: req.body });
  res.json(evaluations);
});

router.put('/evaluations/:id', async (req, res) => {
  const evaluation = await prisma.evaluation.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(evaluation);
});

router.delete('/evaluations/:id', async (req, res) => {
  await prisma.evaluation.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.post('/evaluations', async (req, res) => {
  const evaluation = await prisma.evaluation.create({ data: req.body });
  res.json(evaluation);
});

router.post('/evaluations/batch', async (req, res) => {
  const evaluations = await prisma.evaluation.createMany({ data: req.body });
  res.json(evaluations);
});

router.put('/evaluations/:id', async (req, res) => {
  const evaluation = await prisma.evaluation.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(evaluation);
});

router.delete('/evaluations/:id', async (req, res) => {
  await prisma.evaluation.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.get('/projects', async (req, res) => {
  const projects = await prisma.internalProject.findMany({
    include: { products: true }
  });
  res.json(projects);
});

router.post('/projects', async (req, res) => {
  const { productIds, ...data } = req.body;
  const project = await prisma.internalProject.create({ 
    data: {
      ...data,
      products: productIds ? { connect: productIds.map((id: number) => ({ id })) } : undefined
    } 
  });
  res.json(project);
});

router.put('/projects/:id', async (req, res) => {
  const { productIds, ...data } = req.body;
  const project = await prisma.internalProject.update({
    where: { id: Number(req.params.id) },
    data: {
      ...data,
      products: productIds ? { set: productIds.map((id: number) => ({ id })) } : undefined
    }
  });
  res.json(project);
});

router.delete('/projects/:id', async (req, res) => {
  await prisma.internalProject.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.post('/comments', async (req, res) => {
  const comment = await prisma.comment.create({ data: req.body });
  res.json(comment);
});

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
});

export default router;