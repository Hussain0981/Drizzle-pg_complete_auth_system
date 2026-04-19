import type { Response, Request } from "express";
import express from 'express'
import { getAllService as getSubMenuService } from "../../service/adminSubmenuService";
import { getAllService as getMainMenuService } from "../../service/adminMenuService";
const mainMenuData = await getMainMenuService();
const router = express.Router();

// GET - Settings page with menu data
router.get('/', async (req: Request, res: Response) => {
  try {
    // Fetch menu data
    const subMenuData = await getSubMenuService();
    
    res.render('admin/settings', {
      layout: 'layouts/index', 
      title: 'Settings',
      mainMenu: mainMenuData || [],
      subMenu: subMenuData || []
    });
  } catch (error) {
    console.error('Error fetching menu data:', error);
    res.status(500).render('admin/settings', {
      layout: 'layouts/index',
      title: 'Settings - Error',
      mainMenu: [],
      subMenu: [],
      error: 'Failed to load menu data'
    });
  }
});

// GET - Add main menu form (No data needed)
router.get('/add-main-menu', (req: Request, res: Response) => {
  res.render('admin/mainMenu', {
    layout: 'layouts/index', 
    title: 'Add Main Menu'
  });
});

// GET - Add sub menu form (FIXED: Need to pass mainMenu data)
router.get('/add-sub-menu', async (req: Request, res: Response) => {
  console.log(mainMenuData)
  try {
    // Fetch main menu data for the dropdown
    res.render('admin/subMenu', {
      layout: 'layouts/index', 
      title: 'Add Sub Menu',
      mainMenu: mainMenuData || []
    });
  } catch (error) {
    console.error('Error fetching main menu for sub menu form:', error);
    res.render('admin/subMenu', {
      layout: 'layouts/index', 
      title: 'Add Sub Menu',
      mainMenu: []
    });
  }
});

export default router;