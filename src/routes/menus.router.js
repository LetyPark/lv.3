import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import joi from 'joi';


const router = express.Router();

// const createCategorySchema = joi.object({
//     name: joi.string().min(1).max(10).required().messages({
//         'string.empty': '제목을 입력해주세요.',
//         'string.min': '제목은 최소 1글자 이상이어야 합니다.',
//         'string.max': '제목은 최대 10글자를 초과할 수 없습니다.'
//     }),
//     description:joi.string().min(1).max(50).required().messages({
//         'string.empty': '제목을 입력해주세요.',
//         'string.min': '제목은 최소 1글자 이상이어야 합니다.',
//         'string.max': '제목은 최대 50글자를 초과할 수 없습니다.' 
//     }),
//     image
// })

// 메뉴 등록 API
router.post('/categories/:categoryId/menus', async (req, res, next) => {
    const { categoryId } = req.params;
    const { name, description, image, price } = req.body;

    if (!categoryId || !name || !description || !image || !price) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

    const category = await prisma.categories.findFirst({ where: { categoryId: +categoryId } });
    if (!category) {
        return res.status(404).json({ message: '존재하지 않는 카테고리입니다.' });
    }

    const menu = await prisma.menus.create({
        data: {
            name: name,
            description: description,
            image: image,
            price: price,
            order: (await prisma.categories.count()) + 1,
            categoryId: +categoryId,
        },
    });

    if (price <= 0) {
        return res.status(400).json({ message: '메뉴 가격은 0보다 작을 수 없습니다.' });
    }
    return res.status(201).json({ message: '메뉴를 등록하였습니다.' });
});

// 카테고리별 메뉴 조회 API
router.get('/categories/:categoryId/menus', async (req, res, next) => {
    const { categoryId } = req.params;

    const category = await prisma.categories.findFirst({ where: { categoryId: +categoryId } });
    if (!categoryId) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

    if (!category) {
        return res.status(404).json({ message: '존재하지 않는 카테고리입니다.' });
    }
    const menus = await prisma.menus.findMany({
        where: { categoryId: +categoryId },
        select: {
            menuId: true,
            name: true,
            image: true,
            price: true,
            order: true,
            status: true,
        },
        orderBy: {
            order: 'desc',
        },
    });
    return res.status(200).json({ data: menus });
});


//메뉴 상세조회
router.get('/categories/:categoryId/menus/:menuId', async (req, res) => {
    const{ categoryId, menuId } = req.params;
    const category = await prisma.categories.findUnique({
        where: {
            categoryId: +categoryId
        }
    })
    if(!category){
        res.status(404).json({ message: '존재하지 않는 카테고리 입니다.'})
    }
    const menu = await prisma.menus.findUnique({
        where: {
            menuId: +menuId
        }
    })
    if(!menu){
        res.status(404).json({ message: '존재하지 않는 메뉴 입니다.'})
    }

    const categoryMenus = await prisma.menus.findUnique({
        where: {
            categoryId: +categoryId,
            menuId: +menuId
        }
    })
    return res.status(200).json({data: categoryMenus});
})


//메뉴 수정
router.patch('/categories/:categoryId/menus/:menuId', async (req, res,next)=>{
    const{ categoryId, menuId } = req.params;
    const { name, description, image, price, order, status } = req.body;
    const category = await prisma.categories.findUnique({
        where: {
            categoryId: +categoryId
        }
    })
    if(!category){
        res.status(404).json({ message: '존재하지 않는 카테고리 입니다.'})
    }
    const menu = await prisma.menus.findUnique({
        where: {
            menuId: +menuId
        }
    })
    if(!menu){
        res.status(404).json({ message: '존재하지 않는 메뉴 입니다.'})
    }
    const newMenu = await prisma.menus.update({
        where: {
            categoryId: +categoryId,
            menuId: +menuId
        },
        data: {
            name: name,
            description: description,
            image: image,
            price: price,
            order: order,
            status: status
        }
    })
    return res.status(200).json({message:"메뉴를 수정하였습니다."});
})


//메뉴 삭제
router.delete('/categories/:categoryId/menus/:menuId', async (req, res,next)=>{
    const{ categoryId, menuId } = req.params;
    const category = await prisma.categories.findUnique({
        where: {
            categoryId: +categoryId
        }
    })
    if(!category){
        res.status(404).json({ message: '존재하지 않는 카테고리 입니다.'})
    }
    const menu = await prisma.menus.findUnique({
        where: {
            menuId: +menuId
        }
    })
    if(!menu){
        res.status(404).json({ message: '존재하지 않는 메뉴 입니다.'})
    }
    await prisma.menus.delete({
        where: {
            menuId: +menuId
        }
    })
    return res.status(200).json({message: "메뉴삭제완료"});
})


export default router;
